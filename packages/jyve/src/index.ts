import {PromiseDelegate} from '@phosphor/coreutils';
import {Token} from '@phosphor/coreutils';
import {ISignal, Signal} from '@phosphor/signaling';

import {JupyterLab} from '@jupyterlab/application';
import {nbformat} from '@jupyterlab/coreutils';
import {Kernel, Session, KernelMessage} from '@jupyterlab/services';

import {patches} from './patches';
import {JyveSession} from './session';
import {JyveKernel} from './kernel';

// tslint:disable-next-line
const {version} = require('../package.json') as any;

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
  lyb(name: string): Promise<any>;
  lyb(name: string, nsHandler: (ns: any) => Promise<void>): void;
  startNew(
    options: Jyve.ISessionOptions
  ): Promise<Session.ISession>;
  makeKernel(options: Kernel.IOptions, id: string): Promise<Jyve.IJyveKernel>;
  version: string;
  frameRequested: ISignal<IJyve, Jyve.IFrameOptions>;
  installLybs(ns: any): Promise<void>;
}

export class Jyve implements IJyve {
  private _lab: JupyterLab;
  private _specs: Kernel.ISpecModels = {default: '', kernelspecs: {}};
  private _factories = new Map<string, Promise<Jyve.IKernelFactory>>();
  private _ready = new PromiseDelegate<void>();
  private _frameRequested = new Signal<this, Jyve.IFrameOptions>(this);
  private _lybs = new Map<string, (ns: any) => Promise<void>>();

  get version() { return version; }
  get specs() { return this._specs; }
  get ready(): Promise<void> { return this._ready.promise; }

  constructor(lab: JupyterLab) {
    this._lab = lab;
    this.patch();
  }

  get frameRequested(): ISignal<this, Jyve.IFrameOptions> {
    return this._frameRequested;
  }

  async register(options: Jyve.IOptions) {
    await this.ready;
    this._specs.kernelspecs[options.kernelSpec.name] = options.kernelSpec;
    this._factories.set(options.kernelSpec.name, options.newKernel);
    return await this._lab.serviceManager.sessions.refreshSpecs();
  }

  async lyb(name?: string, callback?: (ns: any) => Promise<any>) {
    if (callback) {
      this._lybs.set(name, callback);
      return;
    }
    return this._lybs.get(name);
  }

  async installLybs(ns: any) {
    for (let k of Array.from(this._lybs.keys())) {
      await this._lybs.get(k)(ns);
    }
  }

  patch() {
    Object.keys(patches).map((fn) => (patches as any)[fn](this._lab, this));
    this._ready.resolve(void 0);
  }

  startNew(
    options: Jyve.ISessionOptions
  ): Promise<Session.ISession> {
    let session = JyveSession.startNew({...options, manager: this});
    session.then((session) => {
      const kernel = session.kernel as Jyve.IJyveKernel;
      const path = session.path;
      kernel.frameRequested.connect(() => {
        this._frameRequested.emit({kernel, path});
      });
    });
    return session;
  }

  async makeKernel(options: JyveKernel.IOptions, id: string): Promise<Jyve.IJyveKernel> {
    const factory = ((await this._factories.get(options.name)) as any).newKernel;

    options.lab = this._lab;

    const kernel = await factory(options, id) as Jyve.IJyveKernel;

    return kernel;
  }
}

export namespace Jyve {
  export interface IKernelFactory {
    (options: Kernel.IOptions, id: string): Promise<Jyve.IJyveKernel>;
  }
  export interface IKernelOptions extends Kernel.IOptions {
    lab: JupyterLab;
  }
  export interface IFrameOptions {
    kernel: IJyveKernel;
    path?: string;
  }
  export interface IOptions {
    kernelSpec: Kernel.ISpecModel;
    newKernel: Promise<IKernelFactory>;
  }
  export interface ISessionOptions extends Session.IOptions {
    manager?: IJyve;
  }
  export interface IJyveKernel extends Kernel.IKernel {
    iframe(iframe?: HTMLIFrameElement): Promise<HTMLIFrameElement>;
    frameRequested: ISignal<IJyveKernel, Jyve.IFrameOptions>;
    frameCloseRequested: ISignal<IJyveKernel, void>;
    fakeDisplayData(
      parent: KernelMessage.IMessage,
      data?: nbformat.IMimeBundle,
      metadata?: nbformat.OutputMetadata
    ): KernelMessage.IMessage;

    sendJSON(obj: any): void;
  }
}
