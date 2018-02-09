declare module 'mock-socket' {
  interface IWebSocket extends WebSocket {}
  type TEvent = 'connection' | 'message' | 'close';

  export class WebSocket implements IWebSocket {}
  export class Server {
    constructor(url: string, options?: any);
    on(event: TEvent, callback: Function): void;
    send(data: any, options?: any): void;
    start(): void;
    stop(callback: Function): void;
    close(): void;
  }
}
