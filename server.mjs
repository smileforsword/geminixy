import http from "http";

// 上游 Gemini API 地址
const GEMINI_API_HOST = "generativelanguage.googleapis.com";
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    url.host = GEMINI_API_HOST;
    url.protocol = "https:";

    // 复制请求头
    const headers = new Headers(req.headers);

    // 如果 URL 上有 ?key=xxxx，移到 Authorization header
    const key = url.searchParams.get("key");
    if (key) {
      headers.set("Authorization", `Bearer ${key}`);
      url.searchParams.delete("key");
    }

    // 构造 fetch 请求
    const newRequest = new Request(url.toString(), {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
      redirect: "follow",
      duplex: req.method !== "GET" && req.method !== "HEAD" ? "half" : undefined,
    });

    // 发送请求到 Gemini
    const response = await fetch(newRequest);

    // 设置响应头
    res.writeHead(response.status, Object.fromEntries(response.headers));

    // 返回 body
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);

  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: {
        message: "Proxy error: " + err.message,
        code: 500,
        status: "Internal Server Error"
      }
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
