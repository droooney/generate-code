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

export type Offset = Location | number

export default class CodeGenerator {
  public constructor(options: Options);
  public add(chunk: string): this;
  public addWithMap(chunk: string, map: SourceMap, offset?: Offset): this;
  public addWithMapping(chunk: string, offset?: Offset, name?: string): this;
  public generateMap(): SourceMap;
  public toString(): string;
}
