import fastify from "fastify";
import { problemDetailsHandler } from "./middleware/error-handler.js";
import { uploadRoutes } from "./routes/upload.js";

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.setErrorHandler(problemDetailsHandler);

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(uploadRoutes, { prefix: "/api/v1" });

  return app;
}
