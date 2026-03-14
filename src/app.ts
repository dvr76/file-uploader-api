import fastify from "fastify";
import { problemDetailsHandler } from "./middleware/error-handler.js";
import { uploadRoutes } from "./routes/upload.js";
import fastifyStatic from "@fastify/static";
import path from "path";

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.setErrorHandler(problemDetailsHandler);

  app.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
  });

  app.get("/", async (_, reply) => {
    return reply.sendFile("demo.html");
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(uploadRoutes, { prefix: "/api/v1" });

  return app;
}
