const _ = require('lodash');
const { default: LinesAndColumns } = require('lines-and-columns');
const { SourceMapGenerator, SourceMapConsumer } = require('source-map');
const mergeMap = require('merge-source-map');
const { decode, encode } = require('sourcemap-codec');

const { hasOwnProperty } = {};

class CodeGenerator {
  constructor(options) {
    if (!hasOwnProperty.call(options, 'filename')) {
      throw new Error('options.filename is required!');
    }

    if (!hasOwnProperty.call(options, 'sourceContent')) {
      throw new Error('options.sourceContent is required!');
    }

    this._code = '';
    this._source = options.sourceContent;
    this._filename = options.filename;
    this._map = new SourceMapGenerator.fromSourceMap(
      new SourceMapConsumer({
        version: 3,
        sources: [options.filename],
        names: [],
        mappings: '',
        sourcesContent: [this._source]
      })
    );
    this._origLines = new LinesAndColumns(this._source);
    this._genLines = new LinesAndColumns('');

    this._sourceMap = !!_.get(options, 'sourceMap', true);
    this._inputSourceMap = !!_.get(options, 'inputSourceMap', null);
  }

  _addMapping({ generated, original, name }) {
    if (this._sourceMap) {
      this._map.addMapping({
        generated: {
          line: generated.line + 1,
          column: generated.column
        },
        original: {
          line: original.line + 1,
          column: original.column
        },
        source: this._filename,
        name
      });
    }

    return this;
  }

  _applyMap(map) {
    if (this._sourceMap) {
      const smc = new SourceMapConsumer(map);

      smc.eachMapping(({
        generatedLine: genLine,
        generatedColumn: genCol,
        originalLine: origLine,
        originalColumn: origCol,
        name
      }) => {
        this._addMapping({
          generated: {
            line: genLine - 1,
            column: genCol
          },
          original: {
            line: origLine - 1,
            column: origCol
          },
          name
        });
      });
    }

    return this;
  }

  _getLastLocation() {
    return this._genLines.locationForIndex(this._code.length);
  }

  _shiftGeneratedMap(map, { line, column }) {
    const mappings = _.times(line, () => []).concat(decode(map.mappings));

    mappings[line].forEach((mapping) => {
      mapping[0] += column;
    });
    map.mappings = encode(mappings);

    return this;
  }

  _shiftOriginalMap(map, { line, column }) {
    const mappings = decode(map.mappings);

    mappings.forEach((lineMappings) => {
      lineMappings.forEach((mapping) => {
        if (mapping[2] === 0) {
          mapping[3] += column;
        }

        mapping[2] += line;
      });
    });
    map.mappings = encode(mappings);

    return this;
  }

  add(code) {
    this._code += code;
    this._genLines = new LinesAndColumns(this._code);

    return this;
  }

  addWithMap(code, map, position) {
    const loc = this._getLastLocation();

    if (typeof position === 'number') {
      position = this._origLines.locationForIndex(position);
    } else if (!position) {
      position = {
        line: 0,
        column: 0
      };
    }

    if (map) {
      this
        ._shiftOriginalMap(map, position)
        ._shiftGeneratedMap(map, loc)
        ._applyMap(map);
    }

    return this.add(code);
  }

  addWithMapping(code, position, name) {
    const loc = this._getLastLocation();

    if (typeof position === 'number') {
      position = this._origLines.locationForIndex(position);
    } else if (!position) {
      position = {
        line: null,
        column: null
      };
    }

    return this
      ._addMapping({
        generated: loc,
        original: position,
        name
      })
      .add(code);
  }

  getCurrentIndent() {
    const currentLineStartIndex = this._genLines.indexForLocation({
      line: this._genLines.locationForIndex(this._code.length).line,
      column: 0
    });

    return this._code.slice(currentLineStartIndex).match(/^\s*/)[0];
  }

  generateMap() {
    return this._sourceMap
      ? mergeMap(this._inputSourceMap, this._map.toJSON())
      : null;
  }

  toString() {
    return this._code;
  }
}

module.exports = CodeGenerator;
