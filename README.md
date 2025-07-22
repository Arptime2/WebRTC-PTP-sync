# WebRTC P2P Test

This project demonstrates a simple peer-to-peer WebRTC connection without a signaling server. The offer and answer SDPs are exchanged manually.

## How to use

1.  Open `index.html` in two different browser tabs or on two different computers on the same network.
2.  **Peer 1:** Click "Create Offer".
3.  Copy the generated Offer SDP.
4.  **Peer 2:** Paste the Offer SDP into the "Paste Offer SDP here" text area.
5.  **Peer 2:** Click "Create Answer".
6.  Copy the generated Answer SDP.
7.  **Peer 1:** Paste the Answer SDP into the "Paste Answer SDP here" text area.
8.  **Peer 1:** Click "Set Answer".
9.  The connection should now be established. You can send messages between the two peers.
