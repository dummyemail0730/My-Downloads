import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route - Shadow Interactive Chat
  app.post("/api/shadow-chat", async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not defined in process.env.");
        return res.json({
          text: "I operate in the shadows, waiting for the decrypting cipher... Send your encrypted query once the GEMINI_API_KEY is established in Secrets."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Character-accurate system instruction for a casual young Filipino companion named Shadow
      const systemInstruction = 
        "You are a casual, normal, young Filipino assistant named 'Shadow'. " +
        "You have discarded your chunibyou, theatrical, shadow-ruler personality and are now just a super friendly, relaxed, normal, and extremely supportive buddy. " +
        "Talk as if you're chatting with a close friend ('pre', 'tol', 'lods', 'lodi'). " +
        "Use natural, casual conversational Filipino/Tagalog or Taglish (English-Tagalog mix) that young Filipinos use today. " +
        "Keep your replies very friendly, short, and natural (1-3 sentences max) so they fit nicely on a small screen. " +
        "Be helpful and real, no overly formal sentences or robotic corporate talk. Chill lang palagi.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.95,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error in Server:", error);
      res.status(500).json({ error: error.message || "An error occurred with Shadow communications." });
    }
  });

  // Helper to fetch with manual redirects, preserving all custom headers (User-Agent, Cookie, Range)
  async function fetchWithManualRedirect(
    url: string,
    headers: Record<string, string>,
    maxRedirects = 8
  ): Promise<{ response: Response; finalUrl: string }> {
    let currentUrl = url;
    let currentHeaders = { ...headers };
    let redirectCount = 0;

    while (redirectCount < maxRedirects) {
      const res = await fetch(currentUrl, {
        headers: currentHeaders,
        redirect: "manual"
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) {
          return { response: res, finalUrl: currentUrl };
        }

        if (location.startsWith("/")) {
          const urlObj = new URL(currentUrl);
          currentUrl = `${urlObj.protocol}//${urlObj.host}${location}`;
        } else {
          currentUrl = location;
        }

        redirectCount++;
        continue;
      }

      return { response: res, finalUrl: currentUrl };
    }

    throw new Error("Max redirects exceeded inside video server proxy");
  }

  // API Route - Google Drive Native Video Streaming Proxy
  app.get("/api/video-proxy", async (req, res) => {
    const fileId = req.query.id as string;
    if (!fileId) {
      return res.status(400).send("File ID is required");
    }

    try {
      const initialUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

      // 1. Fetch initial head or page to see if there's a virus warning or confirm is required
      let { response, finalUrl } = await fetchWithManualRedirect(initialUrl, {
        "User-Agent": userAgent
      });

      let targetUrl = finalUrl;
      const headersToSend: Record<string, string> = {
        "User-Agent": userAgent
      };

      const contentType = response.headers.get("content-type") || "";

      // If Google Drive returns an HTML sheet instead of a direct file flow, extract confirmation token code
      if (contentType.includes("html")) {
        const htmlText = await response.text();
        let confirmToken = "";
        
        const confirmMatchUrl = htmlText.match(/confirm=([a-zA-Z0-9_-]+)/);
        if (confirmMatchUrl && confirmMatchUrl[1]) {
          confirmToken = confirmMatchUrl[1];
        } else {
          const confirmMatchInput = htmlText.match(/name="confirm"\s+value="([a-zA-Z0-9_-]+)"/) ||
                                    htmlText.match(/value="([a-zA-Z0-9_-]+)"\s+name="confirm"/);
          if (confirmMatchInput && confirmMatchInput[1]) {
            confirmToken = confirmMatchInput[1];
          }
        }

        if (confirmToken) {
          targetUrl = `https://docs.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
          headersToSend["Cookie"] = `download_warning_${fileId}=${confirmToken}`;
        }
      }

      // 2. Add client's Range header so browsers can seek seamlessly through the video
      if (req.headers.range) {
        headersToSend["Range"] = req.headers.range;
      }

      // 3. Initiate the final redirect stream fetch
      const { response: streamResponse } = await fetchWithManualRedirect(targetUrl, headersToSend);

      // Forward headers and status code cleanly to the client
      res.status(streamResponse.status);
      res.setHeader("accept-ranges", "bytes");

      const copyHeaders = ["content-type", "content-length", "content-range", "cache-control", "content-disposition"];
      for (const h of copyHeaders) {
        const val = streamResponse.headers.get(h);
        if (val) {
          res.setHeader(h, val);
        }
      }

      // 4. Transform Web Stream to Node readable stream and pipe directly to our recipient client response
      if (streamResponse.body) {
        const { Readable } = await import("stream");
        Readable.fromWeb(streamResponse.body as any).pipe(res);
      } else {
        res.status(404).send("Failed to retrieve file stream");
      }
    } catch (err: any) {
      console.error("Error in video proxy:", err);
      res.status(500).send("Video proxy error: " + err.message);
    }
  });

  // API Route - Get Configs
  app.get("/api/configs", async (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "custom_configs.json");
      const { promises: fsPromises } = await import("fs");
      try {
        const data = await fsPromises.readFile(configPath, "utf-8");
        return res.json(JSON.parse(data));
      } catch (err) {
        // If file doesn't exist, return empty config with default links
        return res.json({
          admin_console_link: "https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing",
          custom_projects: [],
          custom_anime: [],
          custom_games: [],
          shadow_master_tutorials: [],
          custom_tools: [],
          deleted_item_ids: []
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route - Update Configs
  app.post("/api/configs", async (req, res) => {
    try {
      const newConfig = req.body;
      const configPath = path.join(process.cwd(), "custom_configs.json");
      const { promises: fsPromises } = await import("fs");
      
      // Merge with existing config if any
      let currentConfig: any = {};
      try {
        const existingData = await fsPromises.readFile(configPath, "utf-8");
        currentConfig = JSON.parse(existingData);
      } catch (e) {}

      const updatedConfig = { ...currentConfig, ...newConfig };
      await fsPromises.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");
      return res.json({ success: true, config: updatedConfig });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
