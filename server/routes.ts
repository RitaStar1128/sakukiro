import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stripe } from "./stripe";
import { DONATION_PRODUCTS } from "../shared/products";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stripe Webhook
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];

      try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
          throw new Error("STRIPE_WEBHOOK_SECRET is missing");
        }

        const event = stripe.webhooks.constructEvent(
          req.body,
          sig as string,
          process.env.STRIPE_WEBHOOK_SECRET
        );

        // Handle test events for verification
        if (event.id.startsWith("evt_test_")) {
          console.log("[Webhook] Test event detected, returning verification response");
          return res.json({ verified: true });
        }

        // Handle specific events
        switch (event.type) {
          case "checkout.session.completed":
            const session = event.data.object;
            console.log("Payment successful:", session.id);
            // Here you would typically update the database
            break;
          default:
            console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
  );

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
