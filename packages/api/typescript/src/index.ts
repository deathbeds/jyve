import * as ts from 'typescript';

import {Kernel, KernelMessage} from '@jupyterlab/services';


import {JSUnsafeKernel} from '@deathbeds/jyve-js-unsafe';
import {JyveKernel} from '@deathbeds/jyve/lib/kernel';

const {jyve} = (require('../package.json') as any);

export const kernelSpec: Kernel.ISpecModel = jyve.kernelspec;

export interface IFiles {
  [fileName: string]: {
    file: ts.IScriptSnapshot; ver: number
  };
}

/*
  http://blog.scottlogic.com/2015/01/20/typescript-compiler-api.html
*/
export class JyveHost implements ts.LanguageServiceHost {
    files: IFiles = {};

    log(..._: any[]) { console.log(..._); }
    trace(..._: any[]) { console['trace'](..._); }
    error(..._: any[]) { console.error(..._); }
    getCompilationSettings() { return ts.getDefaultCompilerOptions(); }
    getScriptIsOpen(_: any) { return true; }
    getCurrentDirectory() { return ''; }
    getDefaultLibFileName(_: any) { return 'lib'; }
    getScriptVersion(fn: string) {
      return this.files[fn] ? `${this.files[fn].ver}` : '';
    }
    getScriptSnapshot(fn: string) {
      return this.files[fn] ? this.files[fn].file : null;
    }

    getScriptFileNames(): string[] {
      let names: string[] = [];
      for (let name in this.files) {
        if (this.files.hasOwnProperty(name)) {
          names.push(name);
        }
      }
      return names;
    }

    addFile(fileName: string, body: string) {
      let snap = ts.ScriptSnapshot.fromString(body);
      snap.getChangeRange = (_) => undefined;
      let existing = this.files[fileName];
      if (existing) {
        this.files[fileName].ver++;
        this.files[fileName].file = snap;
      } else {
        this.files[fileName] = { ver: 1, file: snap };
      }
    }
}

export class TypeScriptUnsafeKernel extends JSUnsafeKernel {
  protected kernelSpec = kernelSpec;
  protected runningHistory = [] as string[];
  protected compiledLength = 0;
  protected _host: JyveHost;
  protected _service: ts.LanguageService;
  protected _registry: ts.DocumentRegistry;

  constructor(options?: JyveKernel.IOptions, id?: string) {
    super(options, id);
    this._service = ts.createLanguageService(
      this._host = new JyveHost(),
      this._registry = ts.createDocumentRegistry()
    );
  }

  async handleRestart() {
    this.runningHistory = [];
    this.compiledLength = 0;
    return super.handleRestart();
  }

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
    const filename = 'script.ts';
    this._host.addFile(filename, [...this.runningHistory, code].join('\n'));
    let compilation = this._service.getEmitOutput(filename);
    let compiled = compilation.outputFiles[0].text;
    let diagnostics: ts.Diagnostic[] = [].concat(
      this._service.getSyntacticDiagnostics(filename),
      this._service.getSemanticDiagnostics(filename)
    );

    if (!diagnostics.length) {
      this.runningHistory.push(code);
      let last = compiled.substring(this.compiledLength);
      this.compiledLength = compiled.length;
      return last;
    }

    throw new Error(diagnostics.map((d) => d.messageText).join('\n'));
  }
}

export function newKernel(options: JyveKernel.IOptions, id: string) {
  return new TypeScriptUnsafeKernel(options, id);
}
