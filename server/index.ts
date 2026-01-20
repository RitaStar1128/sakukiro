import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // Apply raw body parsing for Stripe webhooks
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

  // Apply JSON parsing for other routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/stripe/webhook')) {
      next();
    } else {
      express.json()(req, res, next);
    }
  });
  app.use(express.urlencoded({ extended: false }));

  // Register API routes first (including webhook which handles its own body parsing)
  const server = await registerRoutes(app);

  // Serve static files or use Vite middleware
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));
    
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    // Development: Use Vite middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server, // Attach Vite's HMR server to the existing HTTP server
        }
      },
      appType: "custom",
    });

    app.use(vite.middlewares);

    // Serve index.html for non-API routes
    app.use("*", async (req, res, next) => {
      // Skip API routes to prevent returning HTML for API calls
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }

      try {
        const fs = await import("fs/promises");
        const indexPath = path.resolve(__dirname, "..", "client", "index.html");
        let html = await fs.readFile(indexPath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Force JSON response for API routes
    if (req.path.startsWith("/api")) {
      res.status(status).json({ message });
    } else {
      next(err);
    }
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
