import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stripe } from "./stripe";
import { DONATION_PRODUCTS } from "../shared/products";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stripe Checkout Session Creation
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { productId } = req.body;
      const product = DONATION_PRODUCTS.find((p) => p.id === productId);

      if (!product) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
