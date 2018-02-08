import {WebSocket, Server} from 'mock-socket';

export class BrowserKernelSocket extends WebSocket {}

export class BrowserSocketServer extends Server {
  sendJSON(data: any) {
    this.send(JSON.stringify(data));
  }
}
