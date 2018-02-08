import {Kernel, KernelMessage} from '@jupyterlab/services';

import {
  BrowserKernel,
} from '@deathbeds/browserkernels/lib/kernel';

export const kernelSpec: Kernel.ISpecModel = {
  display_name: 'JS (eval)',
  name: 'browserkernel-js-unsafe',
  language: 'javascript',
  argv: ['na'],
  resources: {
    'logo-32x32': '/kernelspecs/python3/logo-32x32.png',
    'logo-64x64': '/kernelspecs/python3/logo-64x64.png'
  }
};


export class JSUnsafeBrowserKernel extends BrowserKernel {
  protected kernelSpec = kernelSpec;

  browserKernelInfo() {
    let info = super.browserKernelInfo();

    return {
      ...info,
      implementation: 'browserkernel-js-unsafe'
    };
  }

  async onMessage(msg: KernelMessage.IMessage) {
    if (await super.onMessage(msg)) {
      return;
    }
    const {msg_type} = msg.header;
    switch (msg_type) {
      case 'execute_request':
        this.server.sendJSON(this.fakeStatusReply(msg, 'busy'));
        await this.executeWithEval(msg);
        this.server.sendJSON(this.fakeStatusReply(msg, 'idle'));
        return true;
      default:
        return false;
    }
  }

  async executeWithEval(msg: KernelMessage.IMessage) {
    const {code} = (msg.content as any);
    let result: any;
    try {
      await (async function() {
        /* tslint:disable */
        result = await eval(code);
        /* tslint:enable */
      }).call(this.userNS);
      this.server.sendJSON(this.fakeExecuteResult(msg, {
        'text/plain': `${result}`
      }));
      this.server.sendJSON(this.fakeExecuteReply(msg));
    } catch (err) {
      let errMsg = this.fakeExecuteReply(msg, 'error');
      errMsg.content = {
        ename: `${err.name}`,
        ealue: `${err.message}`,
        traceback: (err.stack || '').split('\n'),
        ...errMsg.content
      };
      this.server.sendJSON(errMsg);
      return;
    }
  }
}

export function newKernel(options: BrowserKernel.IOptions, id: string) {
  return new JSUnsafeBrowserKernel(options, id);
}
