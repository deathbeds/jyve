import {PromiseDelegate} from '@phosphor/coreutils';
import {Token} from '@phosphor/coreutils';
// import {ISignal, Signal} from '@phosphor/signaling';

import {JupyterLab} from '@jupyterlab/application';
import {Kernel, Session} from '@jupyterlab/services';


import {patches} from './patches';
import {JyveSession} from './session';

/* tslint:disable */
/**
 * The browser kernel manager token.
 */
export
const IJyve = new Token<IJyve>('@deathbeds/jyve:IJyve');
/* tslint:enable */

export interface IJyve {
  ready: Promise<void>;
  specs: Kernel.ISpecModels;
  register(options: Jyve.IOptions): Promise<void>;
  startNew(
    options: Jyve.ISessionOptions
  ): Promise<Session.ISession>;
  makeKernel(options: Kernel.IOptions, id: string): Jyve.IJyveKernel;
}

export class Jyve implements IJyve {
  private _lab: JupyterLab;
  private _specs: Kernel.ISpecModels = {default: '', kernelspecs: {}};
  private _factories = new Map<string, Jyve.IKernelFactory>();
  private _ready = new PromiseDelegate<void>();

  get specs() { return this._specs; }
  get ready(): Promise<void> { return this._ready.promise; }

  constructor(lab: JupyterLab) {
    this._lab = lab;
    this.patch();
  }

  async register(options: Jyve.IOptions) {
    await this.ready;
    this._specs.kernelspecs[options.kernelSpec.name] = options.kernelSpec;
    this._factories.set(options.kernelSpec.name, options.newKernel);
    return await this._lab.serviceManager.sessions.refreshSpecs();
  }

  patch() {
    [patches.patchGetSpecs, patches.patchStartNew, patches.patchRestartKernel]
      .map((fn) => fn(this._lab, this));
    this._ready.resolve(void 0);
  }

  startNew(
    options: Jyve.ISessionOptions
  ): Promise<Session.ISession> {
    return JyveSession.startNew({...options, manager: this});
  }

  makeKernel(options: Kernel.IOptions, id: string): Jyve.IJyveKernel {
    const factory = this._factories.get(options.name);
    return factory(options, id);
  }
}

export namespace Jyve {
  export interface IKernelFactory {
    (options: Kernel.IOptions, id: string): Kernel.IKernel;
  }
  export interface IOptions {
    kernelSpec: Kernel.ISpecModel;
    newKernel: IKernelFactory;
  }
  export interface ISessionOptions extends Session.IOptions {
    manager?: IJyve;
  }
  export interface IJyveKernel extends Kernel.IKernel {}
}
