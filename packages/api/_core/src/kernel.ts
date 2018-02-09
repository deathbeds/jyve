import {URLExt} from '@jupyterlab/coreutils';
import {DefaultKernel} from '@jupyterlab/services/lib/kernel/default';
import {Kernel, ServerConnection, KernelMessage} from '@jupyterlab/services';
import {uuid, nbformat} from '@jupyterlab/coreutils';
import {JyveServer} from './socket';

import {Jyve} from '.';

const {jyve, name, version} = (require('../package.json') as any);


const KERNEL_SERVICE_URL = 'api/kernels';


export class JyveKernel extends DefaultKernel implements Jyve.IJyveKernel {
  protected kernelSpec: Kernel.ISpecModel;
  protected server: JyveServer;
  protected userNS: any;
  private _executionCount = 0;

  constructor(options: JyveKernel.IOptions, id: string) {
    super(options, id);
    this.server = options.server;
    this.server.on('message', async (msg: any) => await this._onMessage(msg));
    this.userNS = {};
    (this as any)._connectionPromise.resolve(void 0);
  }

  sendJSON(data: any) {
    this.server.send(JSON.stringify(data));
  }

  async onMessage(msg: KernelMessage.IMessage) {
    switch (msg.header.msg_type) {
      case 'execute_request':
        this.sendJSON(this.fakeExecuteInput(msg));
        return false;
      case 'kernel_info_request':
        this.sendJSON(this.fakeKernelInfo(msg));
        return true;
      default:
        return false;
    }
  }

  private async _onMessage(rawMsg: string) {
    const msg = JSON.parse(rawMsg) as KernelMessage.IMessage;
    this.sendJSON(this.fakeStatusReply(msg, 'busy'));
    const handled = await this.onMessage(msg);
    this.sendJSON(this.fakeStatusReply(msg, 'idle'));
    if (!handled) {
      console.groupCollapsed(`unhandled ${msg.header.msg_type}`);
      console.log(JSON.stringify(msg, null, 2));
      console.groupEnd();
    }
  }

  async getSpec() {
    return this.kernelSpec;
  }

  get info() {
    return this.jyveInfo();
  }

  jyveInfo(): KernelMessage.IInfoReply {
    return {
      banner: 'This kernel is running in your browser',
      help_links: [
        {
          text: 'Jyve on GitHub',
          url: 'https://github.com/deatheds/jyve'
        },
      ],
      implementation: name,
      implementation_version: version,
      language_info: jyve.language_info,
      protocol_version: '5.1',
      status: 'ok'
    };
  }

  fakeHeader(msgType: string) {
    const msgId = uuid();
    return {
      version: '5.3',
      date: (new Date()).toISOString(),
      session: this.clientId,
      username: this.username,
      msg_type: msgType,
      msg_id: msgId
    };
  }

  fakeKernelInfo(parent: KernelMessage.IMessage) {
    const header = this.fakeHeader('kernel_info_reply');
    return {
      header,
      msg_id: header.msg_id,
      msg_type: header.msg_type,
      parent_header: parent.header,
      metadata: {},
      content: this.jyveInfo(),
      buffers: [] as ArrayBuffer[],
      channel: 'shell' as KernelMessage.Channel
    };
  }

  fakeStatusReply(
    parent: KernelMessage.IMessage,
    status: Kernel.Status='idle'
  ): KernelMessage.IMessage {
    const header = this.fakeHeader('status');
    return {
      header,
      parent_header: header,
      metadata: {},
      content: {
        execution_state: status
      },
      buffers: [] as ArrayBuffer[],
      channel: 'iopub' as KernelMessage.Channel
    };
  }

  fakeExecuteReply(
    parent: KernelMessage.IMessage,
    status = 'ok'
  ): KernelMessage.IMessage {
    const header = this.fakeHeader('execute_reply');
    return {
      header,
      parent_header: parent.header,
      metadata: {},
      content: {
        execution_count: this._executionCount,
        payload: [] as string[],
        status: status,
        user_expressions: {}
      },
      buffers: [] as ArrayBuffer[],
      channel: 'shell' as KernelMessage.Channel
    };
  }

  fakeExecuteResult(
    parent: KernelMessage.IMessage,
    data: nbformat.IMimeBundle = {},
    metadata: nbformat.OutputMetadata = {}
  ): KernelMessage.IMessage {
    const header = this.fakeHeader('execute_result');
    return {
      header,
      parent_header: parent.header,
      metadata: {},
      content: {
        execution_count: this._executionCount,
        data,
        metadata,
      },
      buffers: [] as ArrayBuffer[],
      channel: 'iopub' as KernelMessage.Channel
    };
  }

  fakeError(
    parent: KernelMessage.IMessage,
    ename: string,
    evalue: string,
    traceback: string[]
  ): KernelMessage.IMessage {
    const header = this.fakeHeader('error');
    return {
      header,
      parent_header: parent.header,
      metadata: {},
      content: {
        ename,
        evalue,
        traceback
      },
      buffers: [] as ArrayBuffer[],
      channel: 'iopub' as KernelMessage.Channel
    };
  }

  fakeExecuteInput(
    parent: KernelMessage.IMessage
  ): KernelMessage.IMessage {
    const header = this.fakeHeader('execute_input');
    return {
      header,
      parent_header: parent.header,
      metadata: {},
      content: {
        code: parent.content.code,
        execution_count: this._executionCount++
      },
      buffers: [] as ArrayBuffer[],
      channel: 'iopub' as KernelMessage.Channel
    };
  }
}

export namespace JyveKernel {
  export interface IOptions extends Kernel.IOptions {
    server: JyveServer;
  }
  export function kernelURL(
    kernelId: string,
    clientId: string,
    settings: ServerConnection.ISettings,
  ) {
    let partialUrl = URLExt.join(settings.wsUrl, KERNEL_SERVICE_URL,
                                 encodeURIComponent(kernelId));
    let url = URLExt.join(
        partialUrl,
        'channels?session_id=' + encodeURIComponent(clientId)
    );
    // If token authentication is in use.
    let token = settings.token;
    if (token !== '') {
      url = url + `&token=${encodeURIComponent(token)}`;
    }
    return url;
  }
}
