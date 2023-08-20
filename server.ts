import {serveDir} from "https://deno.land/std@0.197.0/http/file_server.ts";
import * as path from "https://deno.land/std@0.197.0/path/mod.ts";

function generateRoomID() {
  return crypto.getRandomValues(new Uint8Array(2)).reduce(
    (hex, byte) => `${hex}${byte.toString(16)}`,
    ``,
  ).padStart(4, "0");
}
let broadcaster = {} as WebSocket;
let viewer = {} as WebSocket;
Deno.serve((req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const moduleDir = path.dirname(path.fromFileUrl(Deno.mainModule));
  const publicDir = path.join(moduleDir, "public");
 
  if (pathname.startsWith("/broadcaster")) {
    return serveDir(req, {
      fsRoot: publicDir,
    });
  } else if (pathname.startsWith("/viewer")) {
    return serveDir(req, {
      fsRoot: publicDir
    });
  }

  if (req.headers.get("upgrade") == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.addEventListener("open", () => {
      const role = url.searchParams.get("role");
      //console.log(role);
      if (role === "broadcaster") {
        broadcaster = socket;
        broadcaster.addEventListener("message", ({ data }) => {
          //console.log(`broadcaster sends: ${data}`);
          viewer.send(data);
        });
      } else if (role === "viewer") {
        viewer = socket;
        viewer.addEventListener("message", ({ data }) => {
          //console.log(`viewer sends: ${data}`);
          broadcaster.send(data);
        });
      }
    });

    socket.addEventListener("close", () => {
    });
    return response;
  }
  return new Response("404: Not Found", {
    status: 404,
  });
});