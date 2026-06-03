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

      // Dynamically load updated custom configuration for absolute up-to-date knowledge
      const configPath = path.join(process.cwd(), "custom_configs.json");
      const { promises: fsPromises } = await import("fs");
      let customConfig: any = {};
      try {
        const fileContent = await fsPromises.readFile(configPath, "utf-8");
        customConfig = JSON.parse(fileContent);
      } catch (err) {
        console.warn("Could not read custom_configs.json for Shadow knowledge-base, using empty fallback.");
      }

      // Compile a comprehensive knowledge base of the website
      const kb = {
        website_title: "Shadow Master Hub / Shadow Arts Academy Portal",
        about: "This portal is managed by Shadow, Cid Kagenou's modern digital presence. It houses pre-configured files, high-grade lightweight Windows operating systems, productivity suites, hardware diagnostics tools, and interactive shadow arts training tutorials.",
        
        static_projects: [
          {
            title: "G.S. W11 ISO",
            description: "An optimized, lightweight, bootable Ghost Spectre Windows 11 ISO / Windows Preinstallation Environment (WinPE).",
            tags: ["Rust", "Vulkan", "Graphics", "ISO", "OS"],
            link: "https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing"
          },
          {
            title: "G.S W10 ISO",
            description: "An optimized, lightweight Ghost Spectre Windows 10 ISO / Windows Preinstallation Environment (WinPE).",
            tags: ["OS", "Utility", "Windows", "ISO"],
            link: "https://drive.google.com/file/d/1-eZazHgsDtT0xAW94L2woWfK4sbFPC71/view?usp=sharing"
          },
          {
            title: "Microsoft Office",
            description: "Complete productivity suite featuring Microsoft Word, Excel, PowerPoint, and Outlook pre-activated and pre-configured.",
            tags: ["Office", "Utility", "Productivity"],
            link: "https://drive.google.com/drive/folders/1PQ2CG9rLB1QbtbcaR8z0T37qUl0J0e_1?usp=sharing"
          },
          {
            title: "Omni Script",
            description: "Custom scripting language for procedural animation and generative architecture patterns utilizing LLVM.",
            tags: ["LLVM", "Compiler", "Generative"]
          },
          {
            title: "Aether CMS",
            description: "Headless content management system with a focus on developer experience and speed.",
            tags: ["Go", "PostgreSQL", "API"]
          }
        ],

        static_tools: [
          { name: "TECHNICAL TOOLKIT", version: "2.4.0", description: "all-in-one, bootable Windows Preinstallation Environment (WinPE) for operating system installation & diagnostics.", category: "W10 & W11", link: "https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing" },
          { name: "3DP CHIP", version: "1.2.1", description: "Driver utility helper.", category: "W10 & OLDER" },
          { name: "DDU", version: "0.8.5", description: "Display Driver Uninstaller to completely uninstall and clean remnants of legacy graphics drivers.", category: "W11, W10, W8, W7" },
          { name: "CPU-Z", version: "1.0.2", description: "System profiling and chip monitoring utility.", category: "W11, W10, W8,W7, Vista, & XP" },
          { name: "HWINFO", version: "7.42.0", description: "Professional hardware analysis, monitoring, and thermal reporting utility.", category: "W11, W10, W8, W7" },
          { name: "RUFUS", version: "4.1.0", description: "Utility that helps format and create bootable USB flash drives easily.", category: "W11, W10" },
          { name: "NOVA DASHBOARD", version: "1.0.0", description: "Real-time system analytics engine with modular layout components.", category: "TypeScript, D3.js, React" }
        ],

        tutorials: [
          { index: "01", title: "INTRO TO SHADOW ARTS", category: "BEGINNER", duration: "12:47", difficulty: "EASY", description: "Learn fundamentals of shadow manipulation, rebuilding system bootloaders (BCD), MBR, and UEFI partition configurations." },
          { index: "02", title: "SHADOW WALKING", category: "FUNDAMENTALS", duration: "18:32", difficulty: "EASY", description: "Learn how to walk across OS structures, load offline Registry hives via WinPE to bypass critical Windows startup failure loops." },
          { index: "03", title: "SHADOW MOLDING", category: "INTERMEDIATE", duration: "24:15", difficulty: "MEDIUM", description: "Shape thermal dynamics. Interpret sensor outputs, voltage logs, and diagnostic cooling gates." },
          { index: "04", title: "FEAR INDUCTION", category: "INTERMEDIATE", duration: "21:03", difficulty: "MEDIUM", description: "Salvage raw and corrupted storage sectors, deploying partition command utilities and file system recovery." },
          { index: "05", title: "SHADOW POSSESSION", category: "ADVANCED", duration: "27:40", difficulty: "HARD", description: "Total network telemetry control, debugging subnet delays, packet logs with Wireshark, mapping firewalls." },
          { index: "06", title: "DOMAIN OF DARKNESS", category: "MASTER LEVEL", duration: "32:18", difficulty: "EXPERT", description: "Isolate stealth persistent security threats like rootkits, rogue thread schedulers, and tracking backdoor scripts with Prozess or Autoruns." }
        ],

        music_ambient: [
          { title: "Midnight Echo", artist: "Silent Path", genre: "Ambient", duration: "3:45" },
          { title: "Neon Pulse", artist: "Circuit Mind", genre: "Synthwave", duration: "4:20" },
          { title: "Glass Horizon", artist: "Ethereal", genre: "Post-Rock", duration: "5:12" },
          { title: "Urban Rain", artist: "Lo-Fi Night", genre: "Lo-Fi", duration: "2:58" },
          { title: "Static Dreams", artist: "Digital Dust", genre: "Glitch", duration: "3:12" },
          { title: "Lunar Drift", artist: "Orbital", genre: "Deep Space", duration: "6:30" }
        ],

        custom_dynamic_data: {
          admin_console_video_stream: customConfig.admin_console_link || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
          custom_projects: customConfig.custom_projects || [],
          custom_anime_episodes: customConfig.custom_anime || [],
          custom_games: customConfig.custom_games || [],
          custom_tools: customConfig.custom_tools || [],
          shadow_master_uploaded_tutorials: customConfig.shadow_master_tutorials || []
        }
      };

      // Live password generators for user on-demand requests
      const generateAlphanumericPassword = (length = 8) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let pwd = "";
        for (let i = 0; i < length; i++) {
          pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pwd;
      };

      const liveSecurePassword = generateAlphanumericPassword(8);
      const liveMemorablePassword = generateAlphanumericPassword(8);
      const liveGuestPasscode = generateAlphanumericPassword(8);

      // Construct character instruction embedded with the live updated knowledge base
      const systemInstruction = 
        "You are 'Shadow', a cool, young man who is the official representative of our company. " +
        "You chat in a natural, cool, stylish Taglish (relaxed Filipino-English mix) like a chill buddy. " +
        "Be friendly but highly direct. Avoid introductory pleasantries, wrapping words, or conversational filler. Get straight to the point. " +
        "\n\n" +
        "CRITICAL KNOWLEDGE BASE ACCESS:\n" +
        JSON.stringify(kb) +
        "\n\n" +
        "PASSWORD GENERATOR CORES:\n" +
        "If they ask to generate a password, passcode, key, or similar:\n" +
        "Choose ONLY ONE of the following live codes and output exactly: 'Eto po yung password: <CODE>' (absolutely no other text, explanation, or special symbols!):\n" +
        `- Password Alpha Variant 1: \`${liveSecurePassword}\`\n` +
        `- Password Alpha Variant 2: \`${liveMemorablePassword}\`\n` +
        `- Password Alpha Variant 3: \`${liveGuestPasscode}\`\n` +
        "Note: Each code has been mathematically pruned to contain ONLY letters and numbers, and it is exactly 8 characters long. It is fully certified to work in the guest login system.\n" +
        "\n\n" +
        "REPLY RULEBOOK:\n" +
        "1. If they ask about any file, project, tool, or ISO download, reply with ONLY the direct markdown link. E.g. 'Eto po yung download link: [G.S W10 ISO](https://drive.google.com/file/d/1-eZazHgsDtT0xAW94L2woWfK4sbFPC71/view?usp=sharing)'. Keep it to one line.\n" +
        "2. If requested, provide precise facts from the website elements (tutorials, tools, specs). No hallucinated or extra stuff.\n" +
        "3. NO FILLER, NO WRAP-UPS, ABSOLUTE DIRECTNESS. If they ask for something, answer directly in cool Taglish. For example: 'Eto po yung password: X8A9P2N1'. Do not say 'Hi lods!' or 'Pili ka na lang dyan' or 'Sana makatolong to'. Answer with pure directness as a company representative.\n" +
        "4. If they ask 'anong meron dito' or ask what this is or what the company offers, you must state directly that we offer online computer repair service, e.g., 'We offer online computer repair service, pre!' or 'Online computer repair service po ino-offer namin dito, pre.' keep it cool and Taglish.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.95,
        }
      });

      res.json({
        text: response.text,
        generatedPasscodes: [liveSecurePassword, liveMemorablePassword, liveGuestPasscode]
      });
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
