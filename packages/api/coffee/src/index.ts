import * as coffeescript from 'coffeescript';

import {Kernel, KernelMessage} from '@jupyterlab/services';

import {JSUnsafeKernel} from '@deathbeds/jyve-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

export const kernelSpec: Kernel.ISpecModel = {
  display_name: 'coffee (eval)',
  name: 'jyve-coffee-unsafe',
  language: 'coffeescript',
  argv: ['na'],
  resources: {
    'logo-32x32': '/kernelspecs/python3/logo-32x32.png',
    'logo-64x64': '/kernelspecs/python3/logo-64x64.png'
  }
};


export class CoffeeUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;

  jyveInfo(): KernelMessage.IInfoReply {
    const info = super.jyveInfo();
    return {
      ...info,
      help_links: [
        ...info.help_links,
        {
          text: 'CoffeeScript',
          url: 'http://coffeescript.org/'
        },
      ],
      implementation: kernelSpec.name,
      language_info: {
        codemirror_mode: {
          name: 'coffeescript'
        },
        file_extension: '.coffee',
        mimetype: 'text/coffeescript',
        name: 'coffeescript',
        nbconvert_exporter: 'coffeescript',
        pygments_lexer: 'coffeescript',
        version: 'ES2015'
      }
    };
  }

  async transpile(code: string) {
    return coffeescript.compile(code, {bare: true});
  }
}

export function newKernel(options: JyveKernel.IOptions, id: string) {
  return new CoffeeUnsafeKernel(options, id);
}
