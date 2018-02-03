import {
  Kernel,
} from '@jupyterlab/services';

import {
  BrowserKernelManager,
} from 'browserkernels';


export const kernelSpec = {
  display_name: 'Unsafe JavaScript',
  name: 'unsafe',
  language: 'javascript',
  argv: ['na'],
  resources: {
    'logo-32x32': '/kernelspecs/python3/logo-32x32.png',
    'logo-64x64': '/kernelspecs/python3/logo-64x64.png'
  }
} as Kernel.ISpecModel;


export class JSUnsafeBrowserKernel implements BrowserKernelManager.IKernel {
  get spec() {
    return kernelSpec;
  }
}
