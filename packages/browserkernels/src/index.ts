import {PromiseDelegate} from '@phosphor/coreutils';
import {Token} from '@phosphor/coreutils';
// import {ISignal, Signal} from '@phosphor/signaling';

import {JupyterLab} from '@jupyterlab/application';
import {Kernel, Session} from '@jupyterlab/services';


import {patches} from './patches';
import {BrowserSession} from './session';

/* tslint:disable */
/**
 * The browser kernel manager token.
 */
export
const IBrowserKernelManager = new Token<IBrowserKernelManager>('@deathbeds/browserkernels:IBrowserKernelManager');
/* tslint:enable */

export interface IBrowserKernelManager {
  ready: Promise<void>;
  specs: Kernel.ISpecModels;
  register(options: BrowserKernelManager.IOptions): Promise<void>;
  startNew(
    options: BrowserKernelManager.ISessionOptions
  ): Promise<Session.ISession>;
  makeKernel(options: Kernel.IOptions, id: string): BrowserKernelManager.IBrowserKernel;
}

export class BrowserKernelManager implements IBrowserKernelManager {
  private _lab: JupyterLab;
  private _specs: Kernel.ISpecModels = {default: '', kernelspecs: {}};
  private _factories = new Map<string, BrowserKernelManager.IKernelFactory>();
  private _ready = new PromiseDelegate<void>();

  get specs() { return this._specs; }
  get ready(): Promise<void> { return this._ready.promise; }

  constructor(lab: JupyterLab) {
    this._lab = lab;
    this.patch();
  }

  async register(options: BrowserKernelManager.IOptions) {
    await this.ready;
    this._specs.kernelspecs[options.kernelSpec.name] = options.kernelSpec;
    this._factories.set(options.kernelSpec.name, options.newKernel);
    return await this._lab.serviceManager.sessions.refreshSpecs();
  }

  patch() {
    patches.patchGetSpecs(this._lab, this);
    patches.patchStartNew(this._lab, this);
    this._ready.resolve(void 0);
  }

  startNew(
    options: BrowserKernelManager.ISessionOptions
  ): Promise<Session.ISession> {
    return BrowserSession.startNew({...options, manager: this});
  }

  makeKernel(options: Kernel.IOptions, id: string): BrowserKernelManager.IBrowserKernel {
    const factory = this._factories.get(options.name);
    return factory(options, id);
  }
}

export namespace BrowserKernelManager {
  export interface IKernelFactory {
    (options: Kernel.IOptions, id: string): Kernel.IKernel;
  }
  export interface IOptions {
    kernelSpec: Kernel.ISpecModel;
    newKernel: IKernelFactory;
  }
  export interface ISessionOptions extends Session.IOptions {
    manager?: IBrowserKernelManager;
  }
  export interface IBrowserKernel extends Kernel.IKernel {}
}
