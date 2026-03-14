import { FastifyReply, FastifyRequest } from "fastify";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>(); // in prod, we should use redis if we are having multiple instances of this api
const MAX_UPLOADS = 5;
const WINDOW_MS = 60 * 1000; // 1m

export function rateLimiter(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
) {
  const ip = request.ip; // if we are using a reverse proxy we need to use the forwarded ip headers, this is a simplified example
  const now = Date.now();

  const entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    store.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return done();
  }

  if (entry.count >= MAX_UPLOADS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    reply
      .status(429)
      .header("content-type", "application/problem+json")
      .header("retry-after", String(retryAfter))
      .send({
        type: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
        title: "Too Many Requests",
        status: 429,
        detail: `Rate limit exceeded. Max ${MAX_UPLOADS} uploads per minute. Try again in ${retryAfter}s.`,
        instance: request.url,
      });
    return;
  }

  entry.count++;
  done();
}

// clean up stale entries every 5m
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
).unref();
