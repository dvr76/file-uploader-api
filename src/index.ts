import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  const app = await buildApp();

  try {
    const address = await app.listen({
      port: PORT,
      host: HOST,
    });

    app.log.info(`Server listening on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
