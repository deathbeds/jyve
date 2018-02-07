import {PromiseDelegate} from '@phosphor/coreutils';
import {Token} from '@phosphor/coreutils';
// import {ISignal, Signal} from '@phosphor/signaling';

import {JupyterLab} from '@jupyterlab/application';
import {Kernel} from '@jupyterlab/services';

import {patches} from './patches';


/* tslint:disable */
/**
 * The browser kernel manager token.
 */
export
const IBrowserKernelManager = new Token<IBrowserKernelManager>('@deathbeds/browserkernels:IBrowserKernelManager');
/* tslint:enable */

export interface IBrowserKernelManager {
  register(options: BrowserKernelManager.IOptions): Promise<void>;
  ready: Promise<void>;
  specs: Kernel.ISpecModels;
}

export class BrowserKernelManager implements IBrowserKernelManager {
  private _lab: JupyterLab;
  private _specs: Kernel.ISpecModels = {default: '', kernelspecs: {}};
  private _ready = new PromiseDelegate<void>();

  constructor(lab: JupyterLab) {
    this._lab = lab;
    this.patch();
  }

  async register(options: BrowserKernelManager.IOptions) {
    console.log(`awaiting ready...`);
    await this.ready;
    console.log(`registering ${options.kernelSpec.name}`);
    this._specs.kernelspecs[options.kernelSpec.name] = options.kernelSpec;
    console.log(`fetching specs...`);
    return await this._lab.serviceManager.sessions.refreshSpecs();
  }

  async patch() {
    await patches.patchGetSpecs(this._lab, this);
    // patches.patchSessionManager(this._lab);
    // patches.patchChangeKernel(this._lab);
    this._ready.resolve(void 0);
  }

  get specs() {
    return this._specs;
  }

  get ready(): Promise<void> {
    return this._ready.promise;
  }
}

export namespace BrowserKernelManager {
  export interface IOptions {
    kernelSpec: Kernel.ISpecModel;
  }
}
