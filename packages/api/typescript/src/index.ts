import {Kernel} from '@jupyterlab/services';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

export const {jyve} = (require('../package.json') as any);

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;

export async function newKernel(options: JyveKernel.IOptions, id: string): Promise<Kernel.IKernel> {
  const kernel = await import('./kernel');
  return new kernel.TypeScriptUnsafeKernel(options, id);
}
