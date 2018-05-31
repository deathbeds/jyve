import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

// tslint:disable-next-line
const {jyve} = require('../package.json') as any;

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

  async execute(code: string, userNS: any) {
    const _window = (await this.iframe()).contentWindow as any;
    return new Promise(function(resolve) {
      /* tslint:disable */
      (function() {
        Object.keys(userNS).map((k) => {
          _window[k] = userNS[k];
        });
        resolve(_window.eval(code));
      }.call(userNS));
      /* tslint:enable */
    });
  }

  async execNS(msg: KernelMessage.IMessage) {
    return {
      ...this.userNS,
      display: this.display.messageContext(msg),
    };
  }

  async executeWithEval(msg: KernelMessage.IMessage) {
    const {code} = msg.content as any;
    let result: any;

    const execNS = await this.execNS(msg);

    try {
      const transpiled = await this.transpile(code);
      result = await this.execute(transpiled, execNS);
      if (result == null) {
        result = '';
      }
      this.sendJSON(
        this.fakeExecuteResult(msg, {
          'text/plain': `${result}`,
        })
      );
      this.sendJSON(this.fakeExecuteReply(msg));
      this.sendJSON(this.fakeStatusReply(msg, 'idle'));
    } catch (err) {
      console.groupCollapsed(`${err}`);
      console.error(err);
      console.groupEnd();

      this.sendJSON(this.fakeStatusReply(msg, 'idle'));
      this.sendJSON(
        this.fakeExecuteResult(msg, {
          'text/plain': `${err}`,
        })
      );

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
        ...errReply.content,
      };
      this.sendJSON(errReply);
    }
    Object.keys(execNS).map((k) => {
      if (['display', 'JupyterLab'].indexOf(k) === -1) {
        return;
      }
      this.userNS[k] = execNS[k];
    });
  }

  async interrupt() {
    ((await this.iframe()).contentWindow as any).eval('debugger');
  }
}

export async function newKernel(options: JyveKernel.IOptions, id: string) {
  return new JSUnsafeKernel(options, id);
}
