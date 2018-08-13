// tslint:disable-next-line
/// <reference path="../../../node_modules/@types/webassembly-js-api/index.d.ts"/>

import {Kernel, KernelMessage, ServerConnection} from '@jupyterlab/services';
import {URLExt} from '@jupyterlab/coreutils';

import {JSUnsafeKernel} from '@deathbeds/jyve-kyrnel-js-unsafe';

import {getPyodide, IPyodideWindow} from './pyodyde';

// tslint:disable-next-line
const pkg = require('../package.json') as any;

export const kernelSpec: Kernel.ISpecModel = pkg.jyve.kernelspec;

export class PyodideUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...pkg.jyve.help_links],
      implementation: kernelSpec.name,
      language_info: pkg.jyve.language_info,
    };
  }

  async pyodideWindow() {
    return (await this.iframe()).contentWindow as IPyodideWindow;
  }

  async pyodide(): Promise<void> {
    let window = await this.pyodideWindow();
    if (!window.pyodide) {
      let baseURL =
        URLExt.join(
          ServerConnection.makeSettings().baseUrl,
          'jyve',
          'vendor',
          'pyodide-demo'
        ) + '/';
      await getPyodide(window, baseURL);
      console.log('we have pyodide in kernel');
    }
  }

  resetUserNS() {
    // TODO: Clear the namespace on the Python side
    this.userNS = {};
  }

  async execNS(parent: KernelMessage.IMessage) {
    let window = await this.pyodideWindow();
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
      __PYODIDE__: window.pyodide,
    };

    // TODO: rich display, type inspection
    window.pyodide.write = (data: any) => {
      console.log('displaying', data);
      this.sendJSON(
        this.fakeDisplayData(parent, {
          'text/plain': `${data}`,
        })
      );
    };

    window.pyodide.runPython(
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
