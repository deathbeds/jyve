import {Widget} from '@phosphor/widgets';
import {Message} from '@phosphor/messaging';
import {Jyve} from '.';

const FRAME_ICON_CLASS = 'jyv-FrameIcon';
const FRAME_CLASS = 'jyv-Frame';

export class JyvePanel extends Widget {
  private _iframe: HTMLIFrameElement;
  private _kernel: Jyve.IJyveKernel;

  constructor(options?: Widget.IOptions) {
    super(options);
    this.addClass(FRAME_CLASS);
    this.title.closable = true;
    this.title.icon = FRAME_ICON_CLASS;

    this._iframe = document.createElement('iframe');
    this.node.appendChild(this._iframe);
  }

  protected onCloseRequest(msg: Message): void {
    this._kernel.iframe(null);
    this.dispose();
  }

  get iframe() { return this._iframe; }

  get kernel() { return this._kernel; }
  set kernel(kernel) {
    this._kernel = kernel;
    this._kernel.iframe(this._iframe);
  }
}
