import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { vet } from "./lib/vet.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));

  // API Route: /api/vet
  app.post("/api/vet", async (req, res) => {
    try {
      const { html, ghlFields, helloBarMessage, customSalesPageUrl } = req.body;
      if (!html) {
        return res.status(400).json({ error: "Missing HTML content" });
      }

      const result = await vet({ html, ghlFields, helloBarMessage, customSalesPageUrl });
      res.json(result);
    } catch (error: any) {
      console.error("Vetting Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite integration for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
