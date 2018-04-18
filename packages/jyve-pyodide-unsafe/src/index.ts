import {Kernel} from '@jupyterlab/services';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';
import {Jyve} from '@deathbeds/jyve';

export const {jyve} = (require('../package.json') as any);
export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;


export async function newKernel(options: JyveKernel.IOptions, id: string): Promise<Jyve.IJyveKernel> {
  let kernel = await import('./kernel');
  return new kernel.PyodideUnsafeKernel(options, id);
}
