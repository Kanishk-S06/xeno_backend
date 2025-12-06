import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth";
import tenantRoutes from "./routes/tenants";
import shopifyRoutes from "./routes/shopify";
import insightsRoutes from "./routes/insights";

import {errorHandler} from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/insights", insightsRoutes);

app.get("/", (_, res) => {
  res.send("Backend is running (TypeScript)");
});

app.use(errorHandler);

export default app;
