import { spawn } from "child_process";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const API_TOKEN = process.env.API_TOKEN
  ? process.env.API_TOKEN.length
    ? process.env.API_TOKEN
    : undefined
  : undefined;
const PORT = Number(process.env.PORT);

if (!PORT) {
  throw new Error("Error: `PORT` environment variable is not defined.");
}

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const lc0 = spawn("lc0", ["-w", "/lc0/build/release/t1-512x15x8h-distilled-swa-3395000.pb.gz"]);
  let isAuthenticated = !API_TOKEN;

  lc0.stdout.on("data", (data) => {
    const lines = data
      .toString()
      .trim()
      .split("\n")
      .map((line) => line.trim());

    lines.forEach((line) => {
      console.debug("[lc0]", line);

      if (isAuthenticated) {
        ws.send(JSON.stringify({ type: "uci:response", payload: line }));
      }
    });
  });

  ws.on("message", (message) => {
    try {
      const messageData = JSON.parse(message);
      switch (messageData.type) {
        case "auth:authenticate":
          console.debug("[authenticate]", messageData.payload);

          if (!API_TOKEN || messageData.payload === API_TOKEN) {
            isAuthenticated = true;
            ws.send(JSON.stringify({ type: "auth:authenticated" }));
          } else {
            ws.send(JSON.stringify({ type: "auth:unauthenticated" }));
          }
          break;
        case "uci:command":
          console.debug("[uci:command]", messageData.payload);

          if (isAuthenticated) {
            lc0.stdin.write(`${messageData.payload}\n`);
          }
          break;
      }
    } catch (error) {
      console.error("Error parsing message: ", error);
    }
  });

  ws.on("close", () => {
    lc0.kill();
  });
});

server.on("request", (req, res) => {
  if (req.url === "/check") {
    res.writeHead(200);
    res.end("LeelaDocker is up and running.");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}.`);
});
