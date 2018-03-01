declare module 'coffeescript' {
  export interface IOptions {
    inlineMap?: boolean;
    filename?: string;
    bare?: boolean;
    header?: boolean;
    transpile?: any;
  }

  export interface IOptionsSourceMap extends IOptions {
    sourceMap: boolean;
  }

  export interface IWithSourceMap {
    js: string;
    v3SourceMap: string;
    sourceMap: string;
  }
  export function compile(coffee: string, options?: IOptions): string;
  export function compile(coffee: string, options?: IOptionsSourceMap): IWithSourceMap;
}
