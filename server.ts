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
