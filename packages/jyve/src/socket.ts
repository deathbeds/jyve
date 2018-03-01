import {WebSocket, Server} from 'mock-socket';

const DEBUG = false;

export class JyveSocket extends WebSocket {}

export class JyveServer extends Server {}

export interface IJyveRequest extends Request {}

export interface IJyveResponse extends Response {}

export class JyveRequest implements IJyveRequest {
  cache: RequestCache;
  credentials: RequestCredentials;
  destination: RequestDestination;
  headers: Headers = new Headers();
  integrity: string;
  keepalive: boolean;
  method: string;
  mode: RequestMode;
  redirect: RequestRedirect;
  referrer: string;
  referrerPolicy: ReferrerPolicy;
  type: RequestType;
  url: string;
  signal: AbortSignal;
  bodyUsed: boolean;

  constructor (input: string | IJyveRequest, init?: RequestInit) {
    if (DEBUG) {
      console.log('fake request', input, init);
    }
  }
  clone(): IJyveRequest {
    return new JyveRequest(this);
  }

  async arrayBuffer(): Promise<ArrayBuffer> { return null; }
  async blob(): Promise<Blob> { return null; }
  async json(): Promise<any> { return null; }
  async text(): Promise<string> { return null; }
  async formData(): Promise<FormData> { return null; }
}

export class JyveResponse implements IJyveResponse {
  body: ReadableStream;
  headers: Headers;
  ok: boolean;
  status = 200;
  statusText: string;
  type: ResponseType;
  url: string;
  redirected: boolean;
  bodyUsed: boolean;

  constructor(body: any, init?: ResponseInit) {
    if (DEBUG) {
      console.log('fake response', body, init);
    }
  }

  clone(): IJyveResponse {
    return new JyveResponse(this, null);
  }

  async arrayBuffer(): Promise<ArrayBuffer> { return null; }
  async blob(): Promise<Blob> { return null; }
  async json(): Promise<any> {
    return {name: 'woo', id: 'woo'};
  }
  async text(): Promise<string> { return null; }
  async formData(): Promise<FormData> { return null; }
}

export async function jyveFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  return new JyveResponse(null, null);
}
