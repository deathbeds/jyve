import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-kyrnel-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

// tslint:disable-next-line
const {jyve} = require('../package.json') as any;

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;

export class P5UnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;
  protected _p5: any;

  constructor(options: JyveKernel.IOptions, id: string) {
    super(options, id);
    this.frameChanged.connect(async (_, iframe) => {
      if (iframe && iframe.contentWindow) {
        await P5UnsafeKernel.p5(iframe.contentWindow);
      }
    });
  }

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...jyve.help_links],
      implementation: kernelSpec.name,
      language_info: jyve.language_info,
    };
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
    p5Script.id = 'jyve-kyrnel-p5';
    document.body.appendChild(p5Script);

    let timeout = 0.5;
    while (!window.p5) {
      await JyveKernel.wait(timeout);
      timeout = timeout * 2;
    }

    return window.p5;
  }
}
