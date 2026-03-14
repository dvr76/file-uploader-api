import { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { rateLimiter } from "../middleware/rate-limiter.js";
import { countWords } from "../utils/word-count.js";

const ALLOWED_EXTENSIONS = [".txt", ".csv"];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1mb max because im deploying this assignment on render (basically to slow down abuse)

export async function uploadRoutes(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
  });

  app.post("/upload", { preHandler: rateLimiter }, async (request, reply) => {
    const file = await request.file();

    if (!file) {
      return reply
        .status(400)
        .header("content-type", "application/problem+json")
        .send({
          type: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
          title: "Bad Request",
          status: 400,
          detail: "No file uploaded. Send a file with field name 'file'.",
          instance: request.url,
        });
    }

    const filename = file.filename;
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      await file.toBuffer();
      return reply
        .status(415)
        .header("content-type", "application/problem+json")
        .send({
          type: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/415",
          title: "Unsupported Media Type",
          status: 415,
          detail: `Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed. Got: ${ext}`,
          instance: request.url,
        });
    }
    const buffer = await file.toBuffer();
    const content = buffer.toString("utf-8");
    const wordCount = countWords(content);
    const fileSize = buffer.byteLength;

    return reply.status(200).send({
      name: filename,
      size: fileSize,
      wordCount,
    });
  });
}
