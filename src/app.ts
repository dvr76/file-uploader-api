import fastify from "fastify";

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
