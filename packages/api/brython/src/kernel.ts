import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-js-unsafe';

const {jyve} = (require('../package.json') as any);

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;

const DEBUG = false;


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
      this._brython = await BrythonUnsafeKernel.brython(
        (await this.iframe()).contentWindow
      );
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
      if(!__BRYTHON__.$jyveLocalsMain) {
        __BRYTHON__.$jyveLocalsMain = {}
      }
      __BRYTHON__.meta_path = __BRYTHON__.$meta_path.slice();
      __BRYTHON__.imported['__main__'] = this.__BRYTHON__ || {};
      ${src}
    `;
  }
}

export namespace BrythonUnsafeKernel {
  function wait(timeout: number) {
    return new Promise(resolve => {
      setTimeout(() => resolve('resolved'), timeout);
    });
  }

  export async function brython(window: any) {
    const document = window.document;
    if (window.__BRYTHON__) {
      return window.__BRYTHON__;
    }


    const brythonSrc = (await import('!!raw-loader!brython')) as string;
    console.log('BRYTHON LOADAD');
    const brythonScript = document.createElement('script');
    brythonScript.textContent = brythonSrc;
    brythonScript.id = 'jyve-brython';
    document.body.appendChild(brythonScript);

    const brythonStdLibSrc = (await import('!!raw-loader!brython/brython_stdlib.js')) as string;
    const brythonStdLibScript = document.createElement('script');
    brythonStdLibScript.textContent = brythonStdLibSrc;
    brythonStdLibScript.id = 'jyve-brython-stdlib';
    document.body.appendChild(brythonStdLibScript);

    while (!(window.__BRYTHON__ && window.__BRYTHON__.$meta_path)) {
      await wait(100);
    }

    let brythonInstance = window.__BRYTHON__;

    return brythonInstance;
  }
}
