const { deepStrictEqual, strictEqual } = require('assert');
const { decode, encode } = require('sourcemap-codec');

const CodeGenerator = require('../src');

describe('CodeGenerator#', () => {
  describe('add()', () => {
    it('should add code', () => {
      const code = new CodeGenerator({
        filename: 'test.js',
        sourceContent: 'abc'
      });

      code.add('a\nb\nc');

      strictEqual(code.toString(), 'a\nb\nc');
      deepStrictEqual(transformMap(code.generateMap()), {
        version: 3,
        sources: [],
        names: [],
        mappings: [[]],
        sourcesContent: []
      });
    });
  });
  describe('addWithMap()', () => {
    it('should add code with map', () => {
      const code = new CodeGenerator({
        filename: 'test.js',
        sourceContent: 'abc'
      });

      code.add('a');
      code.addWithMap('\nb', {
        version: 3,
        sources: ['test.js'],
        names: ['b'],
        mappings: encode([
          [],
          [[0, 0, 0, 0, 0]]
        ]),
        sourcesContent: ['b']
      }, 1);
      code.addWithMap('\nc', {
        version: 3,
        sources: ['test.js'],
        names: [],
        mappings: encode([
          [],
          [[0, 0, 0, 0]]
        ]),
        sourcesContent: ['c']
      }, { line: 0, column: 2 });

      strictEqual(code.toString(), 'a\nb\nc');
      deepStrictEqual(transformMap(code.generateMap()), {
        version: 3,
        sources: ['test.js'],
        names: ['b'],
        mappings: [
          [],
          [[0, 0, 0, 1, 0]],
          [[0, 0, 0, 2]]
        ],
        sourcesContent: ['abc']
      });
    });
  });
  describe('addWithMapping()', () => {
    it('should add code with mapping', () => {
      const code = new CodeGenerator({
        filename: 'test.js',
        sourceContent: 'abc'
      });

      code.add('a\n');
      code.addWithMapping('b\n', 1, 'b');
      code.addWithMapping('c', { line: 0, column: 2 });

      strictEqual(code.toString(), 'a\nb\nc');
      deepStrictEqual(transformMap(code.generateMap()), {
        version: 3,
        sources: ['test.js'],
        names: ['b'],
        mappings: [
          [],
          [[0, 0, 0, 1, 0]],
          [[0, 0, 0, 2]]
        ],
        sourcesContent: ['abc']
      });
    });
  });
  describe('getCurrentIndent()', () => {
    it('should return current indent', () => {
      const code = new CodeGenerator({
        filename: 'test.js',
        sourceContent: 'abc'
      });

      code.add('\na');

      strictEqual(code.getCurrentIndent(), '');

      code.add('\n  b');

      strictEqual(code.getCurrentIndent(), '  ');

      code.add('\n\tc');

      strictEqual(code.getCurrentIndent(), '\t');
    });
  });
});

function transformMap(map) {
  map.mappings = decode(map.mappings);

  return map;
}
