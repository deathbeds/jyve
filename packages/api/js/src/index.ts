import {Kernel, KernelMessage} from '@jupyterlab/services';

import {
  jyve,
} from '@deathbeds/jyve/lib/kernel';

export const kernelSpec: Kernel.ISpecModel = {
  display_name: 'JS (eval)',
  name: 'jyve-js-unsafe',
  language: 'javascript',
  argv: ['na'],
  resources: {
    'logo-32x32': '/kernelspecs/python3/logo-32x32.png',
    'logo-64x64': '/kernelspecs/python3/logo-64x64.png'
  }
};


export class JSUnsafeKernel extends jyve {
  protected kernelSpec = kernelSpec;

  jyveInfo() {
    let info = super.jyveInfo();

    return {
      ...info,
      implementation: 'jyve-js-unsafe'
    };
  }

  async onMessage(msg: KernelMessage.IMessage) {
    const handled = await super.onMessage(msg);
    if (handled) {
      return handled;
    }
    const {msg_type} = msg.header;
    switch (msg_type) {
      case 'execute_request':
        await this.executeWithEval(msg);
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
      this.sendJSON(this.fakeExecuteResult(msg, {
        'text/plain': `${result}`
      }));
      this.sendJSON(this.fakeExecuteReply(msg));
    } catch (err) {
      let errMsg = this.fakeExecuteReply(msg, 'error');
      errMsg.content = {
        ename: `${err.name}`,
        ealue: `${err.message}`,
        traceback: (err.stack || '').split('\n'),
        ...errMsg.content
      };
      this.sendJSON(errMsg);
      return;
    }
  }
}

export function newKernel(options: jyve.IOptions, id: string) {
  return new JSUnsafeKernel(options, id);
}
