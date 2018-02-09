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
      console.log('transpiled', transpiled);
      // const trimmed = `${transpiled}/* ENDJYVE */`.replace(
      //   /;?[\s\n]*\/\* ENDJYVE.*/gm, '');
      // console.log('trimmed', trimmed);
      result = await this.execute(transpiled);
      console.log('result', result);
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

export function newKernel(options: JyveKernel.IOptions, id: string) {
  return new JSUnsafeKernel(options, id);
}
