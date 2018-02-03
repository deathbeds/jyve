import {
  Token
} from '@phosphor/coreutils';

import {
  ISignal, Signal
} from '@phosphor/signaling';

import {
  JupyterLab,
} from '@jupyterlab/application';

import {
  Kernel,
} from '@jupyterlab/services';


// import {patches} from './patches';


/* tslint:disable */
/**
 * The browser kernel manager token.
 */
export
const IBrowserKernelManager = new Token<IBrowserKernelManager>('@deathbeds/browserkernels:IBrowserKernelManager');
/* tslint:enable */

export interface IBrowserKernelManager {
  register(name: string, options: BrowserKernelManager.IOptions): void;
  unregister(name: string): void;
  specsChanged: ISignal<IBrowserKernelManager, void>;
}

export class BrowserKernelManager implements IBrowserKernelManager {
  private _lab: JupyterLab;
  private _specs = new Map<string, BrowserKernelManager.IOptions>();
  private _specsChanged = new Signal<this, void>(this);

  constructor(lab: JupyterLab) {
    this._lab = lab;
    console.log(this._lab);
    // patches.patchSessionManager(this._lab);
    // patches.patchGetSpecs(this._lab);
    // patches.patchChangeKernel(this._lab);
  }

  register(name: string, options: BrowserKernelManager.IOptions) {
    this._specs.set(name, options);
    this._specsChanged.emit(void 0);
  }

  unregister(name: string) {
    this._specs.delete(name);
    this._specsChanged.emit(void 0);
  }

  get specsChanged(): ISignal<this, void> {
    return this._specsChanged;
  }
}

export namespace BrowserKernelManager {
  export interface IOptions {
    name: string;
    kernel: IKernel;
  }

  export interface IKernel {
    spec: Kernel.ISpecModel;
  }
}
