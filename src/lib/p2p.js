class P2P {
    static PEER_OPENED = 'peerOpened';
    static PEER_ERROR = 'peerError';
    static PEER_CLOSED = 'peerClosed';
    static PEER_CONNECTED = 'peerConnected';
    static PEER_DISCONNECTED = 'peerDisconnected';

    static CONNECTION_OPENED = 'connectionOpened';
    static CONNECTION_ERROR = 'connectionError';
    static CONNECTION_CLOSED = 'connectionClosed';
    static CONNECTION_DATA_RECEIVED = 'connectionDataReceived';

    static #eventTarget = new EventTarget();

    static #peer = (() => {
        const peer = new Peer();
        P2P.#listenPeer(peer);
        return peer;
    })();
    static #connections = {};

    static #id;
    static get id() {
        return P2P.#id;
    }

    static connect(id) {
        if (P2P.#connections[id] !== undefined) {
            return;
        }

        const connection = this.#peer.connect(id);

        P2P.#listenConnection(connection);

        P2P.#connections[id] = connection;
    }

    static on(event, callback) {
        P2P.#eventTarget.addEventListener(event, ({detail}) => {
            callback(detail);
        });
    }

    // static off(event, callback) {
    //     P2P.#eventTarget.removeEventListener(event, callback);
    // }

    static shareConnection(id) {
        const connections = [];

        for (let peer in P2P.#connections) {
            // we don't need current user or target user
            if (peer !== P2P.#id && peer !== id) {
                connections.push(peer);
            }
        }

        if (connections.length > 0) {
            P2P.#connections[id].send({
                from: P2P.#id,
                connections
            });

            console.log(`P2P: Connections was sent to ${id}`);
        } else {
            console.log(`P2P: Connections weren't sent to ${id}, because nothing to send`);
        }
    }

    static sendMessageTo(id, message) {
        P2P.#connections[id].send(message);

        console.log(`P2P: Message ${JSON.stringify(message)} to ${id} was sent`);
    }

    static sendMessageToAll(message) {
        for (let id in P2P.#connections) {
            P2P.sendMessageTo(id, message);
        }
    }

    static #listenPeer(peer) {
        peer.on('open', (id) => {
            console.log(`P2P: Connection with p2p server is opened. My p2p ID is ${id}`);

            P2P.#id = id;
            P2P.#emit(P2P.PEER_OPENED, id);

        });

        peer.on('error', (error) => {
            console.error('P2P: Error in connection with p2p server', error);

            P2P.#emit(P2P.PEER_ERROR, error);
        });

        peer.on('close', (data) => {
            console.log('P2P: Connection to p2p server is closed', data);

            P2P.#emit(P2P.PEER_CLOSED, data);
        });

        peer.on('connection', (connection) => {
            console.log(`P2P: Peer ${connection.peer} is connected to you`);

            P2P.#connections[connection.peer] = connection;
            P2P.#listenConnection(connection);
            P2P.#emit(P2P.PEER_CONNECTED, connection.peer);
        });

        peer.on('disconnected', (connection) => {
            console.log(`P2P: Peer ${connection.peer} is disconnected from you`);

            P2P.#emit(P2P.PEER_DISCONNECTED, connection);
        });
    }

    static #listenConnection(connection) {
        connection.on('open', () => {
            console.log(`P2P: Connection with ${connection.peer} is opened`);

            P2P.#emit(P2P.CONNECTION_OPENED, connection.peer);
        });

        connection.on('error', (error) => {
            console.error(`P2P: Error in connection with ${connection.peer}`, error);

            P2P.#emit(P2P.CONNECTION_ERROR, error);
        });

        connection.on('close', (data) => {
            console.log(`P2P: Connection with ${connection.peer} is closed`, data);

            delete P2P.#connections[connection.peer];

            P2P.#emit(P2P.CONNECTION_CLOSED, data);
        });

        connection.on('data', (data) => {
            console.log(`P2P: Message from ${connection.peer} was received`, data);

            P2P.#emit(P2P.CONNECTION_DATA_RECEIVED, data);
        });
    }

    static #emit(name, data) {
        const event = new CustomEvent(name, { detail: data });
        P2P.#eventTarget.dispatchEvent(event);
    }
}

export default P2P;