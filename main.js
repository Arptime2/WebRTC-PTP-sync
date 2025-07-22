document.addEventListener('DOMContentLoaded', () => {

    // --- SECTION 1: SAME-PAGE AUTOMATED TEST --- //
    const setupBtn = document.getElementById('setup-connection');
    if (setupBtn) {
        const peer1Status = document.getElementById('peer1-status');
        const peer1Messages = document.getElementById('peer1-messages');
        const peer1Input = document.getElementById('peer1-message-input');
        const peer1SendBtn = document.getElementById('peer1-send-message');

        const peer2Status = document.getElementById('peer2-status');
        const peer2Messages = document.getElementById('peer2-messages');
        const peer2Input = document.getElementById('peer2-message-input');
        const peer2SendBtn = document.getElementById('peer2-send-message');

        let peer1 = new P2PConnection();
        let peer2 = new P2PConnection();

        peer1.onMessage(message => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `Peer 2 says: ${message}`;
            peer1Messages.appendChild(msgDiv);
        });
        peer1.onConnectionStateChange(state => peer1Status.textContent = `Status: ${state}`);

        peer2.onMessage(message => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `Peer 1 says: ${message}`;
            peer2Messages.appendChild(msgDiv);
        });
        peer2.onConnectionStateChange(state => peer2Status.textContent = `Status: ${state}`);

        peer1SendBtn.addEventListener('click', () => {
            const message = peer1Input.value;
            peer1.sendMessage(message);
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `You sent: ${message}`;
            peer1Messages.appendChild(msgDiv);
            peer1Input.value = '';
        });

        peer2SendBtn.addEventListener('click', () => {
            const message = peer2Input.value;
            peer2.sendMessage(message);
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `You sent: ${message}`;
            peer2Messages.appendChild(msgDiv);
            peer2Input.value = '';
        });

        setupBtn.addEventListener('click', async () => {
            const offer = await peer1.createOffer();
            const answer = await peer2.createAnswer(offer);
            await peer1.setAnswer(answer);
            setupBtn.disabled = true;
            setupBtn.textContent = 'Connection Established!';
        });
    }

    // --- SECTION 2: CROSS-TAB/MANUAL TEST --- //
    const createOfferBtn = document.getElementById('create-offer');
    if (createOfferBtn) {
        const manualStatus = document.getElementById('manual-status');
        const manualMessages = document.getElementById('manual-messages');
        const manualInput = document.getElementById('manual-message-input');
        const manualSendBtn = document.getElementById('manual-send-message');
        
        const createAnswerBtn = document.getElementById('create-answer');
        const setAnswerBtn = document.getElementById('set-answer');
        const offerSdpTextarea = document.getElementById('offer-sdp');
        const answerSdpTextarea = document.getElementById('answer-sdp');
        const offerSdpInputTextarea = document.getElementById('offer-sdp-input');
        const answerSdpInputTextarea = document.getElementById('final-answer-sdp-input');

        let manualPeer = new P2PConnection();

        manualPeer.onMessage(message => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `Remote peer says: ${message}`;
            manualMessages.appendChild(msgDiv);
        });
        manualPeer.onConnectionStateChange(state => manualStatus.textContent = `Status: ${state}`);

        manualSendBtn.addEventListener('click', () => {
            const message = manualInput.value;
            manualPeer.sendMessage(message);
            const msgDiv = document.createElement('div');
            msgDiv.textContent = `You sent: ${message}`;
            manualMessages.appendChild(msgDiv);
            manualInput.value = '';
        });

        createOfferBtn.addEventListener('click', async () => {
            const offer = await manualPeer.createOffer();
            offerSdpTextarea.value = offer;
        });

        createAnswerBtn.addEventListener('click', async () => {
            const offerSdp = offerSdpInputTextarea.value;
            const answer = await manualPeer.createAnswer(offerSdp);
            answerSdpTextarea.value = answer;
        });

        setAnswerBtn.addEventListener('click', async () => {
            const answerSdp = answerSdpInputTextarea.value;
            await manualPeer.setAnswer(answerSdp);
        });
    }
});
