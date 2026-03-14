# File Uploader API

Simple rate-limited file upload API built with Fastify + TypeScript.

**Live demo:**
https://file-uploader-api-94cj.onrender.com/

This project was built as part of a backend assignment. In a real production
system you would typically use presigned S3 URLs instead of sending files
through the API server.

I also completed a project management API for a previous assignment, but the
submission window closed before I could submit it:
https://github.com/dvr76/project-management-api

---

## What it does

- Accepts `.txt` and `.csv` uploads (`multipart/form-data`)
- Rate limits uploads to **5 per minute per IP** (returns `429`)
- Returns file name, size in bytes, and word count
- Errors follow **RFC 7807 Problem Details** format

---

## Setup

```bash
git clone https://github.com/dvr76/file-uploader-api.git
cd file-uploader-api

npm install
npm run build
npm start
```
