# generate-code

The plugin exports a class that helps generate code and sourcemaps.

### Installation

```bash
npm install --save generate-code
```

### Usage

```js
const CodeGenerator = require('generate-code');

const code = new CodeGenerator(options);

code.add('var a, b;\n');
code.addWithMapping(
  'var c;',
  { line: 1, column: 0 },
  { source: 'test.js', name: 'c' }
);

const generatedCode = code.toString();

// var a, b;
// var c;

const generatedMap = code.generateMap();

// {
//   version: 3,
//   ...
// }
```

### API

##### CodeGenerator

```
new CodeGenerator(options: Options)
```

* `options.filename` (required): filename for the sourcemap.
* `options.sourceContent` (required): source content for the sourcemap.
* `options.sourceMap` (default: `true`): if it is needed to generate
a sourcemap.
* `options.inputSourceMap` (default: `null`): input sourcemap.

##### CodeGenerator#add

```
add(chunk: string): this
```

Adds a `chunk` of code to the generated code.

Example:

```js
code.add('fun(1, 2);');
```

##### CodeGenerator#addWithMap

```
addWithMap(
  chunk: string,
  map: SourceMap,
  offset?: Location | number
): this
```

Applies the `map` to the existing map (shifting it according to the
current position in the generated code) and then adds the `chunk`
of code.

Third optional parameter is the offset of the mappings relatively
to the source. Can be a number or a `{ line, column }` object with
0-indexed line.

Example:

```js
const code = new CodeGenerator({
  filename: 'index.js',
  sourceContent: `var a = 10;
var b = {
  c: 1,
  d: 2
};
var c = [];`
});

code.add(`var a = 10;
var b = `);

const {
  code: generated,
  map
} = addUnderscoreToProps(`{
  c: 1,
  d: 2
}`);

code.addWithMap(
  generated,
  map,
  { line: 1, column: 8 } // where '{' is located
);
code.add(`;
var c = [];`);

console.log(code.toString());

// var a = 10;
// var b = {
//   _c: 1,
//   _d: 2,
// };
```

##### CodeGenerator#addWithMapping

```
addWithMapping(
  chunk: string,
  offset?: Location | number,
  name?: string
): this
```

Applies the mapping to the existing map (shifting it according to the
current position in the generated code) and then adds the `chunk`
of code.

Second optional parameter is the offset of the mappings relatively
to the source. Can be a number or a `{ line, column }` object with
0-indexed line.

Third optional argument describes the mapping name.

Example:

```js
const code = new CodeGenerator({
  filename: 'index.js',
  sourceContent: `var a = 10;
var b = {
  c: 1,
  d: 2
};
var c = [];`
});

code.add(`var a = 10;
var b = {
  `);

code.addWithMapping(
  '_c',
  { line: 2, column: 2 }, // where 'c' is located
  'c'
);

code.add(`: 1,
  `);

code.addWithMapping(
  '_d',
  { line: 3, column: 2 }, // where 'd' is located
  'd'
);

code.add(`: 2
};
var c = [];`);

console.log(code.toString());

// var a = 10;
// var b = {
//   _c: 1,
//   _d: 2,
// };
```

##### CodeGenerator#toString()

```
toString(): string
```

Returns the generated code.

##### CodeGenerator#generateMap()

```
generateMap(): SourceMap
```

Returns the generated sourcemap.
