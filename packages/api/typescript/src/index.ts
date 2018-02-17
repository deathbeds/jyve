import * as ts from 'typescript';
import * as tss from 'typescript-simple';

import {Kernel, KernelMessage} from '@jupyterlab/services';


import {JSUnsafeKernel} from '@deathbeds/jyve-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

const {jyve} = (require('../package.json') as any);

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;


export class TypeScriptUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;

  jyveInfo(): KernelMessage.IInfoReply {
    const jsInfo = super.jyveInfo();
    return {
      ...jsInfo,
      help_links: [...jsInfo.help_links, ...jyve.help_links],
      implementation: kernelSpec.name,
      language_info: jyve.language_info
    };
  }

  async transpile(code: string) {
    return await TypeScriptUnsafeKernel.transform(code);
  }
}

export function newKernel(options: JyveKernel.IOptions, id: string) {
  return new TypeScriptUnsafeKernel(options, id);
}

export namespace TypeScriptUnsafeKernel {
  export async function transform (code: string): Promise<string> {
    let compiled = tss(code, {
      module: ts.ModuleKind.ES2015,
      noImplicitAny: true,
    });
    return compiled;
  }
}
