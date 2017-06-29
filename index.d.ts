export interface Options {
  filename: string,
  sourceContent: string,
  sourceMap?: boolean,
  inputSourceMap?: SourceMap
}

export interface SourceMap {
  version: number,
  sources: string[],
  sourcesContent: Array<string | null>,
  names: string[],
  mappings: string,
  file?: string,
  sourceRoot?: string
}

export interface Location {
  line: number,
  column: number
}

export type Position = Location | number

export = class CodeGenerator {
  public constructor(options: Options);
  public add(chunk: string): this;
  public addWithMap(chunk: string, map: SourceMap, position?: Position): this;
  public addWithMapping(chunk: string, position?: Position, name?: string): this;
  public getCurrentIndent(): string;
  public generateMap(): SourceMap;
  public toString(): string;
}
