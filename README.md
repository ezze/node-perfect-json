# node-perfect-json

[![NPM version](https://img.shields.io/npm/v/perfect-json.svg)](https://www.npmjs.com/package/perfect-json)
[![CircleCI](https://circleci.com/gh/ezze/node-perfect-json.svg?style=shield)](https://circleci.com/gh/ezze/node-perfect-json)
[![codecov](https://codecov.io/gh/ezze/node-perfect-json/branch/develop/graph/badge.svg?token=I0ZRW8OP7L)](https://codecov.io/gh/ezze/node-perfect-json)
[![Downloads/month](https://img.shields.io/npm/dm/perfect-json.svg)](https://www.npmjs.com/package/perfect-json)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE.md)

Utility function to beautify JSON string...like JSON.stringify() but better

## Installation

```
npm install perfect-json
```

or

```
yarn add perfect-json
```

## Usage

```javascript
perfectJson(obj, options)
```

- `obj` — JSON to beautify;
- `options` — optional parameters:
    - `indent` — count of indentation spaces (defaults to `2`);
    - `singleLine` — tells whether values of object properties must be placed on a single line, it can be of boolean type or a function returning a boolean result and being invoked for each property of an object recursively — the function receives an object argument with the following properties:
        - `key` — name of the current property (zero-based index in case of array);
        - `value` — value of the current property;
        - `path` — array consisting of names of all ascendant properties including the current one;
        - `items` — array of references to all ascendant objects and arrays;
        - `depth` — zero-based depth level (equals to `path.length` and `items.length`);
        - `indent` — count of indentation spaces per level (`(depth + 1) * indent` results in a summary indentation on a given level).
    - `maxLineLength` — places objects and arrays on a single line if resulting line's length is less than or equal to specified value;
    - `arrayMargin` — characters after opening and before closing array brackets when array is placed on a single line (defaults to empty string  meaning no gap: `["Javascript", "Node.js", "ES6"]`);
    - `objectMargin` — characters after opening and before closing object brackets when object is placed on a single line (defaults to ` ` meaning a gap: `{ "node": "14.0.0", "eslint": true, "babel": true, "typescript": false }`).

### Basic example

Just pass an object to stringify:

```javascript
const perfectJson = require('perfect-json');
console.log(perfectJson({
  name: 'Dmitriy',
  surname: 'Pushkov',
  skills: ["JavaScript", "Node.js", "ES6"],
  env: {
    node: "14.0.0",
    eslint: true,
    babel: true,
    typescript: false
  }
}));
```

Result:

```json
{
  "name": "Dmitriy",
  "surname": "Pushkov",
  "skills": [
    "JavaScript",
    "Node.js",
    "ES6"
  ],
  "env": {
    "node": "14.0.0",
    "eslint": true,
    "babel": true,
    "typescript": false
  }
}
```

### Set indentation size

Use `indent` option:

```javascript
const perfectJson = require('perfect-json');
console.log(perfectJson({
  name: 'Dmitriy',
  surname: 'Pushkov',
  skills: ["JavaScript", "Node.js", "ES6"],
  env: {
    node: "14.0.0",
    eslint: true,
    babel: true,
    typescript: false
  }
}, {
  indent: 4
}));
```

Result:

```json
{
    "name": "Dmitriy",
    "surname": "Pushkov",
    "skills": [
        "JavaScript",
        "Node.js",
        "ES6"
    ],
    "env": {
        "node": "14.0.0",
        "eslint": true,
        "babel": true,
        "typescript": false
    }
}
```

### Place props specific on single line

Use `singleLine` option:

```javascript
const perfectJson = require('perfect-json');
console.log(perfectJson({
  name: 'Dmitriy',
  surname: 'Pushkov',
  skills: [
    "JavaScript",
    "Node.js",
    "ES6"
  ],
  env: {
    node: "14.0.0",
    eslint: true,
    babel: true,
    typescript: false
  }
}, {
  singleLine: ({ key }) => {
    return ['skills', 'env'].includes(key);
  }
}));
```

Result:

```json
{
  "name": "Dmitriy",
  "surname": "Pushkov",
  "skills": ["JavaScript", "Node.js", "ES6"],
  "env": { "node": "14.0.0", "eslint": true, "babel": true, "typescript": false }
}
```

### Limit single line length

Use `maxLineLength` option:

```javascript
const perfectJson = require('perfect-json');
const obj = {
  name: 'Dmitriy',
  surname: 'Pushkov',
  skills: [
    "JavaScript",
    "Node.js",
    "ES6"
  ],
  env: {
    node: "14.0.0",
    eslint: true,
    babel: true,
    typescript: false
  }
};
console.log(perfectJson(obj, {
  maxLineLength: 30
}));
console.log(perfectJson(obj, {
  maxLineLength: 80
}));
```

Result:

```json
{
  "name": "Dmitriy",
  "surname": "Pushkov",
  "skills": [
    "JavaScript",
    "Node.js",
    "ES6"
  ],
  "env": {
    "node": "14.0.0",
    "eslint": true,
    "babel": true,
    "typescript": false
  }
}
```

```json
{
  "name": "Dmitriy",
  "surname": "Pushkov",
  "skills": ["JavaScript", "Node.js", "ES6"],
  "env": { "node": "14.0.0", "eslint": true, "babel": true, "typescript": false }
}
```
