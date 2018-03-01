import * as core from '@phosphor/coreutils';
import {nbformat} from '@jupyterlab/coreutils';
import {KernelMessage} from '@jupyterlab/services';

import {Jyve} from '..';

const DEBUG = false;

if (DEBUG) {
  console.log(core);
}

// kinda like IPython.display
export class Display {
  private _kernel: Jyve.IJyveKernel;

  constructor (kernel: Jyve.IJyveKernel) {
    this._kernel = kernel;
  }

  messageContext(parent: KernelMessage.IMessage) {
    const display = (
      data: nbformat.IMimeBundle,
      metadata?: nbformat.OutputMetadata
    ) => this.display(parent, data, metadata);

    return {
      display,
    };
  }

  display (
    parent: KernelMessage.IMessage,
    data: nbformat.IMimeBundle,
    metadata?: nbformat.OutputMetadata
  ): void {
    let k = this._kernel;
    k.sendJSON(k.fakeDisplayData(parent, data, metadata));
  }
}
