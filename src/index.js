import './lib/copy-paste.js';
import P2P from './lib/p2p.js';

const userIdInput = document.querySelector('#userIdInput');
const userNameInput = document.querySelector('#userNameInput');
const interlocutorIdInput = document.querySelector('#interlocutorIdInput');
const connectButton = document.querySelector('#connectButton');
const messagesInput = document.querySelector('#messageInput');
const messagesOutput = document.querySelector('#messagesOutput');
const messageSendButton = document.querySelector('#messageSendButton');

messagesInput.addEventListener('keyup', onSendMessage);
messageSendButton.addEventListener('click', onSendMessage);
interlocutorIdInput.addEventListener('keyup', onConnect);
connectButton.addEventListener('click', onConnect);

function onConnect(event) {
    if (event.key && event.key !== 'Enter') {
        return;
    }

    P2P.connect(interlocutorIdInput.value);
}

function onSendMessage(event) {
    if (event.key !== undefined && event.key !== 'Enter') {
        return;
    }

    const text = messagesInput.value.trim();
    messagesInput.value = '';
    if (text === '') {
        return;
    }

    attachMessage('Me', text);

    if (userNameInput.value) {
        P2P.sendMessageToAll({ from: userNameInput.value, text });
    } else {
        P2P.sendMessageToAll({ from: P2P.id, text});
    }
}

function attachMessage(from, text) {
    messagesOutput.value = `${from}: ${text}\n` + messagesOutput.value;
}

P2P.on(P2P.PEER_OPENED, (id) => {
    userIdInput.value = id;
});

P2P.on(P2P.PEER_CONNECTED, (id) => {
    P2P.connect(id);
});

P2P.on(P2P.CONNECTION_OPENED, (id) => {
    P2P.shareConnection(id);
});

P2P.on(P2P.CONNECTION_DATA_RECEIVED, (data) => {
    if (data.text) {
        attachMessage(data.from, data.text);
    }

    if (data.connections) {
        data.connections.forEach((id) => {
            P2P.connect(id);
        });
    }
});