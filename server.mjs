import http from "http";

const GEMINI_API_HOST = "generativelanguage.googleapis.com";
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  url.host = GEMINI_API_HOST;
  url.protocol = "https:";

  try {
    const newRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
      redirect: "follow",
    });

    const response = await fetch(newRequest);

    // 复制响应头
    res.writeHead(response.status, Object.fromEntries(response.headers));
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Proxy error: " + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
