// tslint:disable-next-line
const pkg = require('../package.json') as any;
const {baseURL} = pkg.pyodide;

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

export interface IPyodide {
  runPython(python: string): any;
  write(data: any): void;
  packages: {
    dependencies: {[key: string]: string[]};
  };
  monitorRunDependencies: any;
  loadPackage: any;
}

export interface IPyodideWindow extends Window {
  pyodide?: IPyodide;
  Module?: IPyodideWasm;
}

const DEBUG = false;

/**
 * The main bootstrap script for loading pyodide.
 */
export function getPyodide(
  window: IPyodideWindow,
  callback?: () => void
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const document = window.document;

    ////////////////////////////////////////////////////////////
    // Package loading
    let loadedPackages = new Set();

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
          console.log(`No new packages to load`);
          resolve('No new packages to load');
        }

        window.pyodide.monitorRunDependencies = (n: number) => {
          if (n === 0) {
            toLoad.forEach((_package) => loadedPackages.add(_package));
            delete window.pyodide.monitorRunDependencies;
            const packageList = Array.from(toLoad.keys()).join(', ');
            console.log(`Loaded ${packageList}`);
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
        console.log(`invalidating import cache`);
        window.pyodide.runPython(
          'import importlib as _importlib\n' + '_importlib.invalidate_caches()\n'
        );
      });

      return promise;
    };

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
        if (DEBUG) {
          console.error(err);
        }
      }

      let recursionLimit = depth / 50;
      if (recursionLimit > 1000) {
        recursionLimit = 1000;
      }

      console.log(`Recursion limit set to ${recursionLimit}`);

      pyodide.runPython(`import sys; sys.setrecursionlimit(int(${recursionLimit}))`);
    }

    ////////////////////////////////////////////////////////////
    // Loading Pyodide
    let wasmURL = `${baseURL}pyodide.asm.wasm`;

    // tslint:disable-next-line
    let Module: IPyodideWasm = {} as any;
    window.Module = Module;

    Module.noImageDecoding = true;
    Module.noAudioDecoding = true;
    let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      console.log('Skipping wasm decoding');
      Module.noWasmDecoding = true;
    }

    // tslint:disable-next-line
    const wasm_promise = (WebAssembly as any).compileStreaming(fetch(wasmURL));

    Module.instantiateWasm = (info, receiveInstance) => {
      wasm_promise
        .then((module: any) => {
          console.log('instantiating wasm');
          return WebAssembly.instantiate(module, info);
        })
        .then((instance: any) => {
          console.log('receiving instance');
          return receiveInstance(instance);
        });

      return {};
    };

    Module.filePackagePrefixURL = baseURL;
    Module.locateFile = (path) => baseURL + path;
    const postRunPromise = new Promise((resolve) => {
      Module.postRun = () => {
        delete window.Module;
        console.log('fetching packages');
        fetch(`${baseURL}packages.json`)
          .then((response) => response.json())
          .then((json) => {
            console.log('received json');
            window.pyodide.packages = json;
            fixRecursionLimit(window.pyodide);
            resolve();
          });
      };
    });

    const dataLoadPromise = new Promise((resolve) => {
      console.log('configuring monitorRunDependencies');
      Module.monitorRunDependencies = (n: number) => {
        console.log('monitorRunDependencies', n);
        if (n === 0) {
          delete Module.monitorRunDependencies;
          console.log('resolving monitorRunDependencies');
          resolve();
        }
      };
    });

    Promise.all([postRunPromise, dataLoadPromise])
      .then(() => {
        console.log('resolving the big Promise');
        callback();
        resolve();
      })
      .catch((err) => {
        console.log('REJECTING the big Promise');
        reject(err);
      });

    // tslint:disable-next-line
    let data_script = document.createElement('script');
    data_script.src = `${baseURL}pyodide.asm.data.js`;
    data_script.onload = () => {
      let script = document.createElement('script');
      script.src = `${baseURL}pyodide.asm.js`;
      script.onload = function() {
        // tslint:disable-next-line
        window.pyodide = (window.pyodide as any)(Module);
        window.pyodide.loadPackage = loadPackage;
        console.log('ok, window has pyodide');
      };
      document.head.appendChild(script);
      console.log('appending package script');
    };

    document.head.appendChild(data_script);
    console.log('appending data script');
  });
}
