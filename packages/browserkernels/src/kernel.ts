import {URLExt} from '@jupyterlab/coreutils';
import {DefaultKernel} from '@jupyterlab/services/lib/kernel/default';
import {Kernel, ServerConnection, KernelMessage} from '@jupyterlab/services';
import {uuid, nbformat} from '@jupyterlab/coreutils';
import {BrowserSocketServer} from './socket';

import {BrowserKernelManager} from '.';

const KERNEL_SERVICE_URL = 'api/kernels';


export class BrowserKernel extends DefaultKernel implements BrowserKernelManager.IBrowserKernel {
  protected kernelSpec: Kernel.ISpecModel;
  protected server: BrowserSocketServer;
  protected userNS: any;
  private _executionCount = 0;

  constructor(options: BrowserKernel.IOptions, id: string) {
    super(options, id);
    this.server = options.server;
    this.server.on('message', (msg: any) => this._onMessage(msg));
    this.userNS = {};
  }

  onMessage(msg: KernelMessage.IMessage) {
    switch (msg.header.msg_type) {
      case 'kernel_info_request':
        this.server.sendJSON(this.fakeStatusReply(msg, 'busy'));
        this.server.sendJSON(this.fakeKernelInfo(msg));
        this.server.sendJSON(this.fakeStatusReply(msg, 'idle'));
        return true;
      default:
        return false;
    }
  }

  private _onMessage(msg: string) {
    this.onMessage(JSON.parse(msg));
  }

  async getSpec() {
    return this.kernelSpec;
  }

  browserKernelInfo(): KernelMessage.IInfoReply {
    return {
      banner: 'This kernel is running in your browser',
      help_links: [],
      implementation: 'browserkernel',
      implementation_version: '0.1.0',
      language_info: {
        codemirror_mode: {
          name: 'javascript'
        },
        file_extension: '.js',
        mimetype: 'text/javascript',
        name: 'javascript',
        nbconvert_exporter: 'javascript',
        pygments_lexer: 'javascript',
        version: 'ES2015'
      },
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
      content: this.browserKernelInfo(),
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
    parent: KernelMessage.IMessage, status='ok'
  ): KernelMessage.IMessage {
    const header = this.fakeHeader('execute_reply');
    return {
      header,
      parent_header: parent.header,
      metadata: {},
      content: {
        execution_count: this._executionCount++,
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
        execution_count: this._executionCount++,
        data,
        metadata,
      },
      buffers: [] as ArrayBuffer[],
      channel: 'iopub' as KernelMessage.Channel
    };
  }
}

export namespace BrowserKernel {
  export interface IOptions extends Kernel.IOptions {
    server: BrowserSocketServer;
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
