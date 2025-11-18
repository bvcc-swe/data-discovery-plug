// Moved from /server/insight.js for Vercel serverless deployment
// This file will be deployed as /api/server/insight.js

// ...existing code...

import "dotenv/config";
import express from "express";
import cors from "cors";
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

const app = express();
app.use(cors());
app.use(express.json());

const schema = z.object({
  summary: z.string(),
  anomalies: z.array(z.string()),
});

// Vercel API route: /api/server/insight
app.post("/api/server/insight", async (req, res) => {
  try {
    const { prompt } = req.body;
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema,
      prompt,
    });
    res.json({ summary: object.summary, anomalies: object.anomalies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI call failed" });
  }
});

export default app;
