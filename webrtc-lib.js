class P2PConnection {
    constructor() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [] // No STUN/TURN servers needed for same-network connections
        });
        this.dataChannel = null;
        this.onMessageCallback = null;
        this.onConnectionStateChangeCallback = null;

        // This onicecandidate handler is crucial for robust ICE gathering.
        // It will be overwritten in createOffer/createAnswer to handle the promise resolution.
        this.peerConnection.onicecandidate = null;

        this.peerConnection.onconnectionstatechange = () => {
            if (this.onConnectionStateChangeCallback) {
                this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
            }
        };

        this.peerConnection.ondatachannel = event => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('Data channel is open');
            if (this.onConnectionStateChangeCallback) {
                this.onConnectionStateChangeCallback('datachannel-open');
            }
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel is closed');
             if (this.onConnectionStateChangeCallback) {
                this.onConnectionStateChangeCallback('datachannel-closed');
            }
        };

        this.dataChannel.onmessage = event => {
            if (this.onMessageCallback) {
                this.onMessageCallback(event.data);
            }
        };
    }

    async createOffer() {
        // This promise will resolve when the browser has finished gathering ICE candidates.
        const iceGatheringPromise = new Promise(resolve => {
            this.peerConnection.onicecandidate = (event) => {
                // The browser fires a final candidate event with a null candidate when it's finished.
                if (event.candidate === null) {
                    resolve();
                }
            };
        });

        this.dataChannel = this.peerConnection.createDataChannel('sendChannel');
        this.setupDataChannel();

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        // Wait for the ICE gathering to complete *before* returning the offer.
        await iceGatheringPromise;
        return JSON.stringify(this.peerConnection.localDescription);
    }

    async createAnswer(offerSdp) {
        // This promise will resolve when the browser has finished gathering ICE candidates.
        const iceGatheringPromise = new Promise(resolve => {
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate === null) {
                    resolve();
                }
            };
        });

        const offer = JSON.parse(offerSdp);
        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Wait for the ICE gathering to complete *before* returning the answer.
        await iceGatheringPromise;
        return JSON.stringify(this.peerConnection.localDescription);
    }

    async setAnswer(answerSdp) {
        const answer = JSON.parse(answerSdp);
        await this.peerConnection.setRemoteDescription(answer);
    }

    sendMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(message);
        } else {
            console.error('Data channel is not open.');
        }
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    onConnectionStateChange(callback) {
        this.onConnectionStateChangeCallback = callback;
    }
}
