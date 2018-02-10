import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

const {jyve} = (require('../package.json') as any);


export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;


export class JSUnsafeKernel extends JyveKernel {
  protected kernelSpec = kernelSpec;

  jyveInfo() {
    return {...super.jyveInfo(), implementation: kernelSpec.name};
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

  async transpile(code: string) {
    return code;
  }

  async execute(code: string) {
    return await (async function() {
      /* tslint:disable */
      return await eval(code);
      /* tslint:enable */
    }).call(this.userNS);
  }

  async executeWithEval(msg: KernelMessage.IMessage) {
    const {code} = (msg.content as any);
    let result: any;
    try {
      const transpiled = await this.transpile(code);
      result = await this.execute(transpiled);
      this.sendJSON(this.fakeExecuteResult(msg, {
        'text/plain': `${result}`
      }));
      this.sendJSON(this.fakeExecuteReply(msg));
      this.sendJSON(this.fakeStatusReply(msg, 'idle'));
    } catch (err) {
      console.groupCollapsed(`${err}`);
      console.error(err);
      console.groupEnd();

      this.sendJSON(this.fakeStatusReply(msg, 'idle'));
      this.sendJSON(this.fakeExecuteResult(msg, {
        'text/plain': `${err}`
      }));

      const ename = err.name;
      const evalue = err.message;
      const traceback = (err.stack || '').split('\n');

      let errMsg = this.fakeError(msg, ename, evalue, traceback);
      this.sendJSON(errMsg);

      let errReply = this.fakeExecuteReply(msg, 'error');
      errReply.content = {
        ename,
        evalue,
        traceback,
        ...errReply.content
      };
      this.sendJSON(errReply);
    }
  }
}

export function newKernel(options: JyveKernel.IOptions, id: string) {
  return new JSUnsafeKernel(options, id);
}
