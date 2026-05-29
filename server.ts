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

  // API Route - Google Drive Native Video Streaming Proxy
  app.get("/api/video-proxy", async (req, res) => {
    const fileId = req.query.id as string;
    if (!fileId) {
      return res.status(400).send("File ID is required");
    }

    try {
      const initialUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

      // 1. Fetch initial head or page to see if there's a virus warning / confirm required
      let response = await fetch(initialUrl, {
        headers: { "User-Agent": userAgent }
      });

      let targetUrl = response.url;
      const headers: Record<string, string> = {
        "User-Agent": userAgent
      };

      const contentType = response.headers.get("content-type") || "";

      // If Google Drive returns an HTML sheet instead of a direct file flow, extract confirmation token code
      if (contentType.includes("html")) {
        const htmlText = await response.text();
        const confirmMatch = htmlText.match(/confirm=([a-zA-Z0-9_-]+)/);
        if (confirmMatch && confirmMatch[1]) {
          const confirmToken = confirmMatch[1];
          targetUrl = `https://docs.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
          headers["Cookie"] = `download_warning_${fileId}=${confirmToken}`;
        }
      }

      // 2. Add client's Range header so browsers can seek seamlessly through the video
      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }

      // 3. Initiate the final redirect stream fetch
      const streamResponse = await fetch(targetUrl, { headers });

      // Forward headers and status code cleanly to the client
      res.status(streamResponse.status);
      const copyHeaders = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"];
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
