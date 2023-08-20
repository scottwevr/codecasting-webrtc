# WebRTC Data Channel Broadcast using Deno and WebSockets

This project demonstrates how to create a simple WebRTC data channel broadcast application using Deno for the server-side logic and WebSockets for signaling between clients.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Deno](https://deno.land/)
- Web browser with WebRTC support (Chrome, Firefox, etc.)

## Getting Started

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/scottwevr/codecasting-webrtc.git
   cd codecasting-webrtc
   ```

2. Install the Deno runtime by following the instructions on the [Deno website](https://deno.land/#installation).

3. Run the signaling server:

   ```bash
   deno run --allow-net server.ts
   ```

   This will start the WebSocket signaling server on `http://localhost:8080`.

4. Open two tabs in the browser, navigating the first one to `http://localhost:8080/broadcaster` and the second to `http://localhost:8080/viewer`.

5. When the "Join Codecast" button is clicked on the viewer. This will initiate a WebRTC connection with the server and establish a data channel.

6. Any text that is typed into the broadcaster's text field will be sent to the viewer and displayed in their text field.

## How It Works

1. The signaling server (`server.ts`) uses Deno and the `ws` library to handle WebSocket connections between clients. It facilitates the exchange of offer and answer SDP (Session Description Protocol) for WebRTC peer connections.

2. When the broadcaster page is loaded it establishes a websocket connection with the server and awaits connection offers. 

3. When the viewer clicks the `Join Codecast` button, it creates a RTCPeerConnection and a DataChannel. The creation of the DataChannel triggers the `negotionneeded` events which sends an offer SDP to the signaling server. 

4. The server relays offer and answer SDPs between the users to establish the WebRTC connection. Because the DataChannel has been created it triggers the `datachannel` event which attached a MutationObserver to the text field and any changes trigger the element to be sent over the data channel.

## Notes

- This project is for educational purposes and is far from  production-ready.
- WebRTC requires secure origins (HTTPS or localhost) for Data Channels. If you are testing locally with localhost the websockets need to be changed from `wss` to `ws`.

## License

This project is licensed under the [MIT License](LICENSE).

---

