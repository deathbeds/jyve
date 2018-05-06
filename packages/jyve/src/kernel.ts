import {JupyterLab} from '@jupyterlab/application';
import {URLExt} from '@jupyterlab/coreutils';
import {DefaultKernel} from '@jupyterlab/services/lib/kernel/default';
import {Kernel, ServerConnection, KernelMessage} from '@jupyterlab/services';
import {uuid, nbformat} from '@jupyterlab/coreutils';
import {JyveServer, JyveRequest, jyveFetch} from './socket';
import {ISignal, Signal} from '@phosphor/signaling';

import {Jyve} from '.';
import {Display} from './display';


const {jyve, name, version} = (require('../package.json') as any);

const KERNEL_SERVICE_URL = 'api/kernels';

export class JyveKernel extends DefaultKernel implements Jyve.IJyveKernel {
  protected kernelSpec: Kernel.ISpecModel;
  protected server: JyveServer;
  protected userNS: any;
  private _executionCount = 0;
  private _iframe: HTMLIFrameElement;
  private _lab: JupyterLab;
  private _frameRequested = new Signal<this, Jyve.IFrameOptions>(this);
  private _onRestart: (ns: any) => Promise<void>;
  private _wasLoaded = false;
  private _frameCloseRequested = new Signal<this, void>(this);
  _frameChanged = new Signal<JyveKernel, HTMLIFrameElement>(this);

  display: Display;

  constructor(options: JyveKernel.IOptions, id: string) {
    super(options, id);
    this.server = options.server;
    this._lab = options.lab;
    this._onRestart = options.onRestart;
    this.server.on('message', (msg: string) => this._onMessage(msg));
    this.display = new Display(this);
    this.resetUserNS();
  }

  get frameRequested(): ISignal<this, Jyve.IFrameOptions> {
    return this._frameRequested;
  }

  get frameCloseRequested() {
    return this._frameCloseRequested;
  }

  get frameChanged() {
    return this. _frameChanged;
  }

  async iframe(iframe?: HTMLIFrameElement) {
    if (iframe !== void 0) {
      this._iframe = iframe;
      this._frameChanged.emit(this._iframe);
    } else {
      if (this._iframe == null) {
        this._wasLoaded = false;
        this._frameRequested.emit({kernel: this});
      }
      let timeout = 0.1;
      while (!(this._iframe && this._iframe.contentWindow)) {
        await JyveKernel.wait(timeout);
        timeout = timeout * 2;
      }
      if (!this._wasLoaded) {
        this._wasLoaded = true;
        this._frameChanged.emit(this._iframe);
      }
      return this._iframe;
    }
  }

  resetUserNS() {
    this.userNS = {
      JupyterLab: this._lab
    };

    if (this._onRestart) {
      this._onRestart(this.userNS);
    }
  }

  sendJSON(data: any) {
    this.server.send(JSON.stringify(data));
  }

  private _serverSettings: ServerConnection.ISettings;

  get serverSettings() {
    return {
      ...this._serverSettings,
      Request: JyveRequest,
      fetch: jyveFetch
    };
  }

  set serverSettings(serverSettings) {
    this._serverSettings = serverSettings;
  }

  async onMessage(msg: KernelMessage.IMessage) {
    switch (msg.header.msg_type) {
      case 'execute_request':
        this.sendJSON(this.fakeExecuteInput(msg));
        return false;
      case 'kernel_info_request':
        this.sendJSON(this.fakeStatusReply(msg, 'idle'));
        setTimeout(() => {
          this.sendJSON(this.fakeKernelInfoReply(msg));
        }, 1);
        return true;
      default:
        return false;
    }
  }

  async handleRestart() {
    this.resetUserNS();
    this.frameCloseRequested.emit(void 0);
  }

  private _onMessage(rawMsg: string): void {
    const msg = JSON.parse(rawMsg) as KernelMessage.IMessage;
    this.sendJSON(this.fakeStatusReply(msg, 'busy'));

    setTimeout(async () => {
      try {
        const handled = await this.onMessage(msg);
        if (!handled) {
          console.groupCollapsed(`unhandled ${msg.header.msg_type}`);
          console.log(JSON.stringify(msg, null, 2));
          console.groupEnd();
          this.sendJSON(this.fakeStatusReply(msg, 'idle'));
        }
      } catch (err) {
        console.error(err);
        this.sendJSON(this.fakeStatusReply(msg, 'idle'));
      }
    }, 0);
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

  fakeKernelInfoReply(parent: KernelMessage.IMessage) {
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
    const reply = {
      header,
      parent_header: parent ? parent.header : null,
      metadata: {},
      content: {
        execution_state: status
      },
      buffers: [] as ArrayBuffer[],
      channel: 'iopub' as KernelMessage.Channel
    };
    return reply;
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

  fakeDisplayData(
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
        transient: {},
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
    lab?: JupyterLab;
    onRestart?: (ns: any) => Promise<void>;
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

  export function wait(timeout: number) {
    return new Promise(resolve => {
      setTimeout(() => resolve(void 0), timeout);
    });
  }
}
