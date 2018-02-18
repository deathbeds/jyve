import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

const {jyve} = (require('../package.json') as any);

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;

const DEBUG = true;


export class BrythonUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;
  protected _brython: any;

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...jyve.help_links],
      implementation: kernelSpec.name,
      language_info: jyve.language_info
    };
  }

  async brython() {
    if (!this._brython) {
      this._brython = await BrythonUnsafeKernel.brython();
    }
    return this._brython;
  }

  resetUserNS() {
    this.userNS = {};
    this._brython = null;
  }

  async execNS(parent: KernelMessage.IMessage) {
    const k = this;

    let execNS = await super.execNS(parent);
    const brython =  await this.brython();
    brython.$options = {debug: DEBUG ? 10 : 0};

    execNS = {
      ...execNS,
      __BRYTHON__: brython,
    };

    execNS.__BRYTHON__.stdout.write = function(data: any) {
      k.sendJSON(k.fakeDisplayData(parent, {
        'text/plain': `${data}`
      }));
    };

    execNS.__BRYTHON__.stderr.write = function(data: any) {
      k.sendJSON(k.fakeDisplayData(parent, {
        'text/plain': `${data}`
      }));
    };

    return execNS;
  }

  async transpile(code: string) {
    const brython = await this.brython();
    const obj = brython.py2js(code, '__main__', '__main__', '__builtins__');
    const src = obj.to_js();

    return `
      ${DEBUG ? 'debugger;' : ''}
      var __BRYTHON__ = this.__BRYTHON__;
      var None = __BRYTHON__.None;
      var dict = __BRYTHON__.builtins.dict;
      __BRYTHON__.meta_path = __BRYTHON__.$meta_path.slice();
      ${src}`;
  }
}

export function newKernel(options: JyveKernel.IOptions, id: string) {
  return new BrythonUnsafeKernel(options, id);
}

export namespace BrythonUnsafeKernel {
  export async function brython() {
    if ((window as any).__BRYTHON__) {
      return (window as any).__BRYTHON__;
    }

    function wait(timeout: number) {
      return new Promise(resolve => {
        setTimeout(() => resolve('resolved'), timeout);
      });
    }

    const brythonSrc = (require('!!raw-loader!brython') as any) as string;
    const brythonScript = document.createElement('script');
    brythonScript.textContent = brythonSrc;
    brythonScript.id = 'jyve-brython';
    document.body.appendChild(brythonScript);

    const brythonStdLibSrc = (require('!!raw-loader!brython/brython_stdlib.js') as any) as string;
    const brythonStdLibScript = document.createElement('script');
    brythonStdLibScript.textContent = brythonStdLibSrc;
    brythonStdLibScript.id = 'jyve-brython-stdlib';
    document.body.appendChild(brythonStdLibScript);

    while (!((window as any).__BRYTHON__ && (window as any).__BRYTHON__.$meta_path)) {
      await wait(100);
    }

    let brythonInstance = (window as any).__BRYTHON__;

    return brythonInstance;
  }
}
