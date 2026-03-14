import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export function problemDetailsHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const status = error.statusCode ?? 500;

  const problem: ProblemDetails = {
    type: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${status}`,
    title: getTitle(status),
    status,
    detail: error.message,
    instance: request.url,
  };

  request.log.error({ err: error }, error.message);

  reply
    .status(status)
    .header("content-type", "application/problem+json")
    .send(problem);
}

// I simplified this just for assignment purpose
function getTitle(status: number): string {
  const titles: Record<number, string> = {
    400: "Bad Request",
    413: "Payload Too Large",
    415: "Unsupported Media Type",
    429: "Too Many Requests",
    500: "Internal Server Error",
  };
  return titles[status] ?? "Error";
}
