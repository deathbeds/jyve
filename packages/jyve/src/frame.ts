import {Message} from '@phosphor/messaging';

import {IFrame} from '@jupyterlab/apputils';

import {Jyve} from '.';

const FRAME_ICON_CLASS = 'jyv-FrameIcon';
const FRAME_CLASS = 'jyv-Frame';

export class JyvePanel extends IFrame {
  private _iframe: HTMLIFrameElement;
  private _kernel: Jyve.IJyveKernel;

  constructor() {
    super();
    this.addClass(FRAME_CLASS);
    this.title.closable = true;
    this.title.icon = FRAME_ICON_CLASS;
    this._iframe = this.node.querySelector('iframe');
  }

  dispose() {
    this._kernel.iframe(null);
    super.dispose();
  }

  protected onCloseRequest(msg: Message): void {
    this._kernel.iframe(null);
    this.dispose();
  }

  get iframe() { return this._iframe; }

  get kernel() { return this._kernel; }
  set kernel(kernel) {
    this._kernel = kernel;
    kernel.frameCloseRequested.connect(() => this.dispose());
    this._kernel.iframe(this._iframe);
  }
}
