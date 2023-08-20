

async function joinCodecast() {
  
  const signalingServer = new WebSocket(`ws://${window.location.host}?role=viewer`);
  await new Promise((resolve) =>
    signalingServer.addEventListener("open", resolve)
  );

  const peerConnectionConfig = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302"],
      },
    ],
  };
  const peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.addEventListener("icecandidate", ({ candidate }) => {
    if (candidate && candidate.candidate) {
      signalingServer.send(JSON.stringify(candidate));
    }
  });

  peerConnection.addEventListener("negotiationneeded", async (event) => {
    await peerConnection.setLocalDescription(
      await peerConnection.createOffer(),
    );
    signalingServer.send(JSON.stringify(peerConnection.localDescription));
  });

  const dataChannel = peerConnection.createDataChannel("dataChannel", {
    maxRetransmits: 0,
    reliable: false,
  });

  dataChannel.addEventListener("open", (event) => {
  });

  dataChannel.addEventListener("message", ({ data }) => {
    const replacement = new DOMParser().parseFromString(data, "text/xml").documentElement;
    const codeblock = document.querySelector("code");
    codeblock.replaceWith(replacement);
    //codeblock.textContent = data;
  });

  signalingServer.addEventListener("message", async (event) => {
    const message = JSON.parse(event.data);
    if ("candidate" in message) {
      peerConnection.addIceCandidate(new RTCIceCandidate(message));
    } else if (message.type === "answer") {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(message),
      );
    }
  });
}

document.querySelector(".join").addEventListener("pointerdown", joinCodecast);
