import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

const {jyve} = (require('../package.json') as any);

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;

// const DEBUG = false;


export class PyodideUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;
  protected _pyodide: any;

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...jyve.help_links],
      implementation: kernelSpec.name,
      language_info: jyve.language_info
    };
  }

  async pyodide() {
    if (!this._pyodide) {
      this._pyodide = await PyodideUnsafeKernel.pyodide(
        (await this.iframe()).contentWindow
      );
    }
    return this._pyodide;
  }

  resetUserNS() {
    // TODO: Clear the namespace on the Python side
    this.userNS = {};
    this._pyodide = null;
  }

  async execNS(parent: KernelMessage.IMessage) {
    const k = this;

    let execNS = await super.execNS(parent);
    const pyodide = await this.pyodide();
    // pyodide.$options = {debug: DEBUG ? 10 : 0};

    execNS = {
      ...execNS,
      __PYODIDE__: pyodide,
    };

    pyodide.write = (data: any) => {
        k.sendJSON(k.fakeDisplayData(parent, {
            'text/plain': `${data}`}));
    };

    pyodide.runPython(
        "from js import window as _window\n" +
        "import sys\n" +
        "sys.stdout.write = _window.pyodide.write\n" +
        "sys.stderr.write = _window.pyodide.write\n");

    return execNS;
  }

  async transpile(code: string) {
    await this.pyodide();
    const src = JSON.stringify(code);

    return `__PYODIDE__.runPython(${src});`;
  }
}

function bootstrap_pyodide(window: any) {
  let baseURL = "http://iodide-project.github.io/pyodide-demo/";
  let wasmURL = "https://cdn.rawgit.com/iodide-project/pyodide-demo/a39e3f3e80a438a07e6a8028fa4745768c16cbc2/pyodide.asm.wasm";
  let wasmXHR = new XMLHttpRequest();
  wasmXHR.open('GET', wasmURL, true);
  wasmXHR.responseType = 'arraybuffer';
  wasmXHR.onload = function() {
    let Module: any = {};

    if (wasmXHR.status === 200 || wasmXHR.status === 0) {
      Module.wasmBinary = wasmXHR.response;
    } else {
      console.warn(
        `Couldn't download the pyodide.asm.wasm binary.  Response was ${wasmXHR.status}`);
    }

    Module.baseURL = baseURL;
    let script = window.document.createElement('script');
    script.src = `${baseURL}pyodide.asm.js`;
    script.onload = () => {
      window.pyodide = window.pyodide(Module);
      window.pyodide.then = undefined;
    };
    window.document.body.appendChild(script);
  };
  wasmXHR.send(null);
}

export namespace PyodideUnsafeKernel {
  export async function pyodide(window: any) {
    if (window.pyodide) {
      return window.pyodide;
    }

    bootstrap_pyodide(window);

    let timeout = 0.5;
    let count = 30 / timeout;
    while (!(window.pyodide && window.pyodide.runPython) && count > 0) {
      await JyveKernel.wait(timeout);
      count--;
    }

    if (count <= 0) {
      // TODO: Is there a way to popup an error modal here?
      alert("Pyodide failed to load.");
    }

    let pyodideInstance = window.pyodide;

    return pyodideInstance;
  }
}
