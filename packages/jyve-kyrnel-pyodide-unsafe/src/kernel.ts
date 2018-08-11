// tslint:disable-next-line
/// <reference path="../../../node_modules/@types/webassembly-js-api/index.d.ts"/>

import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-kyrnel-js-unsafe';

import {getPyodide, IPyodide, IPyodideWindow} from './pyodyde';

// tslint:disable-next-line
const pkg = require('../package.json') as any;

export const kernelSpec: Kernel.ISpecModel = pkg.jyve.kernelspec;

// const DEBUG = false;

export class PyodideUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;
  protected _pyodide: IPyodide;

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...pkg.jyve.help_links],
      implementation: kernelSpec.name,
      language_info: pkg.jyve.language_info,
    };
  }

  async pyodide(): Promise<void> {
    if (!this._pyodide) {
      let window = (await this.iframe()).contentWindow as IPyodideWindow;
      await getPyodide(window);
      console.log('we have pyodide in kernel');
      this._pyodide = window.pyodide;
    }
  }

  resetUserNS() {
    // TODO: Clear the namespace on the Python side
    this.userNS = {};
    this._pyodide = null;
  }

  async execNS(parent: KernelMessage.IMessage) {
    let execNS = await super.execNS(parent);
    console.log('waiting for pyodide in execNS');
    try {
      await this.pyodide();
    } catch (err) {
      console.error('EXECNS ERROR', err);
      return;
    }
    console.log("...and we're back in execNS");
    // pyodide.$options = {debug: DEBUG ? 10 : 0};

    execNS = {
      ...execNS,
      __PYODIDE__: this._pyodide,
    };

    // TODO: rich display, type inspection
    this._pyodide.write = (data: any) => {
      console.log('displaying', data);
      this.sendJSON(
        this.fakeDisplayData(parent, {
          'text/plain': `${data}`,
        })
      );
    };

    this._pyodide.runPython(
      'from js import window as _window\n' +
        'import sys\n' +
        'sys.stdout.write = _window.pyodide.write\n' +
        'sys.stderr.write = _window.pyodide.write\n'
    );

    return execNS;
  }

  async transpile(code: string) {
    console.log('waiting for pyodide in transpile');
    await this.pyodide();
    console.log('got it');
    const src = JSON.stringify(code);

    return `__PYODIDE__.runPython(${src});`;
  }
}

export namespace PyodideUnsafeKernel {
  export function pyodide(window: IPyodideWindow): Promise<any> {
    if (window.pyodide) {
      if (typeof window.pyodide === 'function') {
        throw Error(`Shouldn't be here`);
      }
      console.log('namespace had some pyodide', window.pyodide);
      return;
    }

    console.log('promising in namespace function');
    return new Promise((resolve) => {
      getPyodide(window);
      const interval = setInterval(() => {
        console.log('pyodide loaded', !!window.pyodide);
        if (window.pyodide) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }
}
