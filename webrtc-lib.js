class P2PConnection {
    constructor() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [] // No STUN/TURN servers needed for same-network connections
        });
        this.dataChannel = null;
        this.onMessageCallback = null;
        this.onConnectionStateChangeCallback = null;

        this.peerConnection.onicecandidate = event => {
            // Candidates are included in the offer/answer SDP
        };

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
        this.dataChannel = this.peerConnection.createDataChannel('sendChannel');
        this.setupDataChannel();

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        return new Promise(resolve => {
            // Wait for ICE gathering to complete
            this.peerConnection.onicegatheringstatechange = () => {
                if (this.peerConnection.iceGatheringState === 'complete') {
                    resolve(JSON.stringify(this.peerConnection.localDescription));
                }
            };
        });
    }

    async createAnswer(offerSdp) {
        const offer = JSON.parse(offerSdp);
        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        return new Promise(resolve => {
            // Wait for ICE gathering to complete
            this.peerConnection.onicegatheringstatechange = () => {
                if (this.peerConnection.iceGatheringState === 'complete') {
                    resolve(JSON.stringify(this.peerConnection.localDescription));
                }
            };
        });
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
