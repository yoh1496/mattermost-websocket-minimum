const WebSocketClient = require('websocket').client;

class MattermostWebSocket {
  constructor(endPoint) {
    this.endPoint = endPoint;
    this.client = new WebSocketClient();
    this.connection = null;
    this.messageListeners = [];
  }

  sendAsync(dat) {
    return new Promise((resolve, reject) => {
      if (this.connection === null) {
        reject("connection is not established");
      }
      console.log(dat.toString());
      this.connection.send(JSON.stringify(dat), err => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  addListener(listener) {
    this.messageListeners.push(listener);
  }

  handleMessage(message) {
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      this.messageListeners = this.messageListeners.filter( handler => !handler(data));
    }
  }

  connectAsync() {
    return new Promise((resolve, reject) => {
      this.client = new WebSocketClient();
      this.client.on('connect', (conn) => {
        this.connection = conn
        this.connection.on("close",(code, desc)  => {
          console.log('connection is closed', code, desc);
          this.connection = null;
        });
        this.connection.on('message', this.handleMessage.bind(this));
        resolve(conn);
      });
      this.client.on('connectFailed', (err) => {
        reject(err);
        this.connection = null;
      });
      this.client.connect(this.endPoint);
    });
  }
  

  authAsync(token) {
    return new Promise((resolve, reject) => {
      this.addListener((jsonDat) => {
        if (jsonDat.seq_reply === 1 && jsonDat.status === "OK") {
          resolve(true);
          return true;
        }
        return false;
      });
      
      const msg = {
        action: 'authentication_challenge',
        seq: 1,
        data: { token }
      };

      this.sendAsync(msg).then().catch(reject);
    });
  }
}

module.exports = MattermostWebSocket;