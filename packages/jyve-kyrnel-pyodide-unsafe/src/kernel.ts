// tslint:disable-next-line
/// <reference path="../../../node_modules/@types/webassembly-js-api/index.d.ts"/>

import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-kyrnel-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

import {Dialog, showDialog} from '@jupyterlab/apputils';

// tslint:disable-next-line
const pkg = require('../package.json') as any;

export const kernelSpec: Kernel.ISpecModel = pkg.jyve.kernelspec;

// const DEBUG = false;

export class PyodideUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;
  protected _pyodide: any;

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...pkg.jyve.help_links],
      implementation: kernelSpec.name,
      language_info: pkg.jyve.language_info,
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
      k.sendJSON(
        k.fakeDisplayData(parent, {
          'text/plain': `${data}`,
        })
      );
    };

    pyodide.runPython(
      'from js import window as _window\n' +
        'import sys\n' +
        'sys.stdout.write = _window.pyodide.write\n' +
        'sys.stderr.write = _window.pyodide.write\n'
    );

    return execNS;
  }

  async transpile(code: string) {
    await this.pyodide();
    const src = JSON.stringify(code);

    return `__PYODIDE__.runPython(${src});`;
  }
}

export namespace PyodideUnsafeKernel {
  export async function pyodide(window: any) {
    if (window.pyodide) {
      return window.pyodide;
    }

    bootstrapPyodide(window);

    let count = 30;
    while (!window.pyodide) {
      console.log('waiting', window.pyodide);
      await JyveKernel.wait(1000);
      count--;
      if (!count) {
        let answer = await showDialog({
          title: 'Pyodide failed to load',
          body: 'Try waiting a little longer?',
          buttons: [Dialog.cancelButton(), Dialog.okButton()],
        });
        if (answer.value) {
          count = 30;
        } else {
          return null;
        }
      }
    }

    let pyodideInstance = window.pyodide;

    return pyodideInstance;
  }

  // function bootstrapPyodide(window: any) {
  //   console.log('bootstrapping pyodide');
  //   const wasmURL = `${pkg.pyodide.baseURL}pyodide.asm.wasm`;
  //   const wasmXHR = new XMLHttpRequest();
  //   wasmXHR.open('GET', wasmURL, true);
  //   wasmXHR.responseType = 'arraybuffer';
  //   wasmXHR.onprogress = (progress) => {
  //     console.log(progress.total, progress.loaded);
  //   };
  //   wasmXHR.onload = function() {
  //     // tslint:disable-next-line
  //     const Module: any = {};
  //
  //     if (wasmXHR.status === 200 || wasmXHR.status === 0) {
  //       Module.wasmBinary = wasmXHR.response;
  //     } else {
  //       console.warn(
  //         `Couldn't download the pyodide.asm.wasm binary.  Response was ${
  //           wasmXHR.status
  //         }`
  //       );
  //     }
  //
  //     Module.baseURL = pkg.pyodide.baseURL;
  //     let script = window.document.createElement('script');
  //     script.src = `${pkg.pyodide.baseURL}pyodide.asm.js`;
  //     script.onload = () => {
  //       window._pyodide = window.pyodide;
  //       window.pyodide = window._pyodide(Module);
  //     };
  //     window.document.body.appendChild(script);
  //   };
  //   wasmXHR.send(null);
  // }
}

interface IPyodideWasm {
  noImageDecoding: boolean;
  noAudioDecoding: boolean;
  noWasmDecoding: boolean;
  instantiateWasm: (info: any, receiveInstance: any) => any;
  filePackagePrefixURL: string;
  postRun: any;
  monitorRunDependencies: any;
  locateFile: (path: string, baseURL: string) => string;
}

async function bootstrapPyodide(window: any) {
  const document = window.document;
  const {baseURL} = pkg.pyodide;

  let wasmURL = `${baseURL}pyodide.asm.wasm`;
  // tslint:disable-next-line
  let Module = {} as IPyodideWasm;

  window.Module = Module;

  Module.locateFile = (path: string, base: string) => {
    console.log('locate', base, path);
    return `${baseURL}${path}`;
  };

  Module.noImageDecoding = true;
  Module.noAudioDecoding = true;
  let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  if (isFirefox) {
    console.log('Skipping wasm decoding');
    Module.noWasmDecoding = true;
  }

  // tslint:disable-next-line
  let wasm_promise = (WebAssembly as any).compileStreaming(fetch(wasmURL));

  Module.instantiateWasm = (info, receiveInstance) => {
    wasm_promise
      .then((module: any) => WebAssembly.instantiate(module, info))
      .then((instance: any) => receiveInstance(instance));
    return {};
  };

  Module.filePackagePrefixURL = baseURL;
  let postRunPromise = new Promise((resolve) => {
    Module.postRun = () => {
      delete window.Module;
      fetch(`${baseURL}packages.json`)
        .then((response) => response.json())
        .then((json) => {
          window.pyodide.packages = json;
          fixRecursionLimit(window.pyodide);
          resolve();
        });
    };
  });

  let dataLoadPromise = new Promise((resolve) => {
    Module.monitorRunDependencies = (n: number) => {
      if (n === 0) {
        delete Module.monitorRunDependencies;
        resolve();
      }
    };
  });

  Promise.all([postRunPromise, dataLoadPromise]);

  let loadedPackages = new Set<any>();

  let loadPackage = (names: string[]) => {
    // DFS to find all dependencies of the requested packages
    let packages = window.pyodide.packages.dependencies;
    let queue = new Array(...names);
    let toLoad = new Set();
    while (queue.length) {
      const _package = queue.pop();
      if (!loadedPackages.has(_package)) {
        toLoad.add(_package);
        if (packages.hasOwnProperty(_package)) {
          packages[_package].forEach((subpackage: string) => {
            if (!loadedPackages.has(subpackage) && !toLoad.has(subpackage)) {
              queue.push(subpackage);
            }
          });
        } else {
          console.log(`Unknown package '${_package}'`);
        }
      }
    }

    let promise = new Promise((resolve, reject) => {
      if (toLoad.size === 0) {
        resolve('No new packages to load');
      }

      window.pyodide.monitorRunDependencies = (n: number) => {
        if (n === 0) {
          toLoad.forEach((_package: string) => loadedPackages.add(_package));
          delete window.pyodide.monitorRunDependencies;
          const packageList = Array.from(toLoad.keys()).join(', ');
          resolve(`Loaded ${packageList}`);
        }
      };

      toLoad.forEach((_package) => {
        let script = document.createElement('script');
        script.src = `${baseURL}${_package}.js`;
        script.onerror = (e: any) => {
          reject(e);
        };
        document.body.appendChild(script);
      });

      // We have to invalidate Python's import caches, or it won't
      // see the new files. This is done here so it happens in parallel
      // with the fetching over the network.
      window.pyodide.runPython(
        'import importlib as _importlib\n' + '_importlib.invalidate_caches()\n'
      );
    });

    return promise;
  };

  // tslint:disable-next-line
  let data_script = document.createElement('script');
  data_script.src = `${baseURL}pyodide.asm.data.js`;
  data_script.onload = () => {
    let script = document.createElement('script');
    script.src = `${baseURL}pyodide.asm.js`;
    script.onload = () => {
      window._pyodide = window.pyodide;
      window.pyodide = window._pyodide(Module);
      window.pyodide.loadPackage = loadPackage;
    };
    document.head.appendChild(script);
  };

  document.head.appendChild(data_script);
}

function fixRecursionLimit(pyodide: any) {
  // The Javascript/Wasm call stack may be too small to handle the default
  // Python call stack limit of 1000 frames. This is generally the case on
  // Chrom(ium), but not on Firefox. Here, we determine the Javascript call
  // stack depth available, and then divide by 50 (determined heuristically)
  // to set the maximum Python call stack depth.

  let depth = 0;
  function recurse() {
    depth += 1;
    recurse();
  }
  try {
    recurse();
  } catch (err) {
    console.warn(err);
  }

  let recursionLimit = depth / 50;
  if (recursionLimit > 1000) {
    recursionLimit = 1000;
  }
  pyodide.runPython(`import sys; sys.setrecursionlimit(int(${recursionLimit}))`);
}
