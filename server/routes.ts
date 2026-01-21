import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {


  const httpServer = createServer(app);
  return httpServer;
}
