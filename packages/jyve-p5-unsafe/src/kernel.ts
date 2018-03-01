import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

const {jyve} = (require('../package.json') as any);

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;

export class P5UnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;
  protected _p5: any;

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...jyve.help_links],
      implementation: kernelSpec.name,
      language_info: jyve.language_info
    };
  }

  async p5() {
    if (!this._p5) {
      this._p5 = await P5UnsafeKernel.p5(
        (await this.iframe()).contentWindow
      );
    }
    return this._p5;
  }

  async transpile(code: string) {
    const p5 = await this.p5();
    console.log('p5 loaded', p5);
    return code;
  }
}

export namespace P5UnsafeKernel {
  export async function p5(window: any) {
    const document = window.document;
    if (window.p5) {
      return window.p5;
    }

    const p5Src = (await import('!!raw-loader!p5/lib/p5.js')) as string;
    const p5Script = document.createElement('script');
    p5Script.textContent = p5Src;
    p5Script.id = 'jyve-p5';
    document.body.appendChild(p5Script);

    let timeout = 0.5;
    while (!(window.p5)) {
      await JyveKernel.wait(timeout);
      timeout = timeout * 2;
    }

    let p5Instance = window.p5;

    return p5Instance;
  }
}
