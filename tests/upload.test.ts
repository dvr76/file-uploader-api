import { describe, it, expect } from "vitest";
import { buildApp } from "../src/app.js";

// helper fn to build multipart body manually
function buildMultipart(filename: string, content: string, fieldName = "file") {
  const boundary = "----TestBoundary123456";
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--\r\n`;

  return { body, boundary };
}

describe("POST /api/v1/upload", () => {
  it("uploads a .txt file and returns metadata", async () => {
    const app = await buildApp();
    const { body, boundary } = buildMultipart(
      "test.txt",
      "hello world foo bar",
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/upload",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(200);
    const json = response.json();
    expect(json.name).toBe("test.txt");
    expect(json.wordCount).toBe(4);
    expect(json.size).toBeGreaterThan(0);

    await app.close();
  });

  it("uploads a .csv file successfully", async () => {
    const app = await buildApp();
    const { body, boundary } = buildMultipart(
      "data.csv",
      "name,age\nAlice,30\nBob,25",
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/upload",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(200);
    const json = response.json();
    expect(json.name).toBe("data.csv");

    await app.close();
  });

  it("rejects a .exe file with 415", async () => {
    const app = await buildApp();
    const { body, boundary } = buildMultipart("fake.exe", "not a real exe");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/upload",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(415);
    const json = response.json();
    expect(json.title).toBe("Unsupported Media Type");

    await app.close();
  });

  it("returns 400 when no file is sent", async () => {
    const app = await buildApp();

    const boundary = "----TestBoundary123456";
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="notafile"\r\n\r\n` +
      `somevalue\r\n` +
      `--${boundary}--\r\n`;

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/upload",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("returns 429 after exceeding rate limit", async () => {
    const app = await buildApp();

    for (let i = 0; i < 5; i++) {
      const { body, boundary } = buildMultipart(`file${i}.txt`, "hello");
      await app.inject({
        method: "POST",
        url: "/api/v1/upload",
        headers: {
          "content-type": `multipart/form-data; boundary=${boundary}`,
        },
        payload: body,
      });
    }

    // 6th request should be rate limited
    const { body, boundary } = buildMultipart("file6.txt", "hello");
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/upload",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(429);
    const json = response.json();
    expect(json.title).toBe("Too Many Requests");

    await app.close();
  });
});
