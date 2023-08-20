import {broadcast} from "./modules/broadcast.js";

async function beginCodecast() {
  const signalingServer = new WebSocket(`wss://${window.location.host}?role=broadcaster`);
  await new Promise((resolve) =>
    signalingServer.addEventListener("open", resolve)
  );
  let peerConnection = null;
  let dataChannel = null;
  signalingServer.addEventListener("message", async (event) => {
    const message = JSON.parse(event.data);
    if ("candidate" in message && peerConnection !== null) {
      peerConnection.addIceCandidate(new RTCIceCandidate(message));
    }
    if (message.type === "offer") {
      const peerConnectionConfig = {
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302"],
          },
        ],
      };

      peerConnection = new RTCPeerConnection(peerConnectionConfig);

      peerConnection.addEventListener("icecandidate", ({ candidate }) => {
        if (candidate && candidate.candidate) {
          signalingServer.send(JSON.stringify(candidate));
        }
      });
      peerConnection.addEventListener("datachannel", async ({ channel }) => {
        dataChannel = channel;
        await new Promise((resolve) =>
          dataChannel.addEventListener("open", resolve)
        );
        broadcast(document.querySelector("code"), dataChannel);
      });
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(message),
      );
      await peerConnection.setLocalDescription(
        await peerConnection.createAnswer(),
      );
      signalingServer.send(JSON.stringify(peerConnection.localDescription));
    }
  });
}

beginCodecast();
