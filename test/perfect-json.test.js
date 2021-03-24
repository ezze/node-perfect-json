import perfectJson from '../src/perfect-json';

describe('perfect json', () => {
  describe('empty', () => {
    it('object', () => {
      expect(perfectJson({})).toEqual('{}');
    });

    it('array', () => {
      expect(perfectJson([])).toEqual('[]');
    });
  });

  describe('simple', () => {
    const object = { name: 'RESURS', orbit: 5000, remoteSensing: true };
    const array = ['PAN', 'MS', 'PMS'];

    it('object at multiple lines', () => {
      const result = '{\n  "name": "RESURS",\n  "orbit": 5000,\n  "remoteSensing": true\n}';
      expect(perfectJson(object)).toEqual(result);
    });

    it('object at single line', () => {
      const result = '{ "name": "RESURS", "orbit": 5000, "remoteSensing": true }';
      expect(perfectJson(object, { singleLine: true })).toEqual(result);
    });

    it('array at multiple lines', () => {
      const result = '[\n  "PAN",\n  "MS",\n  "PMS"\n]';
      expect(perfectJson(array)).toEqual(result);
    });

    it('at single line', () => {
      const result = '["PAN", "MS", "PMS"]';
      expect(perfectJson(array, { singleLine: true })).toEqual(result);
    });
  });

  describe('complex', () => {
    const object = {
      level: 'L2',
      metadata: {
        bandCombinations: ['PAN', 'MS', 'PMS'],
        cloudMask: true
      }
    };

    it('multiple lines', () => {
      const result = '{\n' +
        '  "level": "L2",\n' +
        '  "metadata": {\n' +
        '    "bandCombinations": [\n' +
        '      "PAN",\n' +
        '      "MS",\n' +
        '      "PMS"\n' +
        '    ],\n' +
        '    "cloudMask": true\n' +
        '  }\n' +
        '}';
      expect(perfectJson(object)).toEqual(result);
    });

    it('nested array on single line', () => {
      const result = '{\n' +
        '  "level": "L2",\n' +
        '  "metadata": {\n' +
        '    "bandCombinations": ["PAN", "MS", "PMS"],\n' +
        '    "cloudMask": true\n' +
        '  }\n' +
        '}';
      expect(perfectJson(object, {
        singleLine: ({ key, depth }) => {
          return key === 'bandCombinations' && depth === 2;
        }
      })).toEqual(result);
    });

    it('nested object on single line', () => {
      const result = '{\n' +
        '  "level": "L2",\n' +
        '  "metadata": { "bandCombinations": ["PAN", "MS", "PMS"], "cloudMask": true }\n' +
        '}';
      expect(perfectJson(object, {
        singleLine: ({ key }) => {
          return key === 'metadata' || key === 'bandCombinations';
        }
      })).toEqual(result);
    });

    it('restrict single line by max length', () => {
      const result80 = '{\n' +
        '  "level": "L2",\n' +
        '  "metadata": { "bandCombinations": ["PAN", "MS", "PMS"], "cloudMask": true }\n' +
        '}';
      const result40 = '{\n' +
        '  "level": "L2",\n' +
        '  "metadata": {\n' +
        '    "bandCombinations": ["PAN", "MS", "PMS"],\n' +
        '    "cloudMask": true\n' +
        '  }\n' +
        '}';
      expect(perfectJson(object, { maxLineLength: 80 })).toEqual(result80);
      expect(perfectJson(object, { maxLineLength: 40 })).toEqual(result40);
    });
  });

  describe('advanced', () => {
    it('array of objects', () => {
      const array = [
        { name: 'RESURS', orbit: 5000 },
        { name: 'KANOPUS', orbit: 2250 },
        { name: 'METEOR', orbit: 1750 }
      ];
      const result = '[{\n' +
        '  "name": "RESURS",\n' +
        '  "orbit": 5000\n' +
        '}, {\n' +
        '  "name": "KANOPUS",\n' +
        '  "orbit": 2250\n' +
        '}, {\n' +
        '  "name": "METEOR",\n' +
        '  "orbit": 1750\n' +
        '}]';
      expect(perfectJson(array)).toEqual(result);
    });

    it('nested array of objects', () => {
      const object = {
        processing: {
          rules: [{
            levels: ['L0', 'L2']
          }, {
            levels: ['RAW', 'L0', 'L2']
          }]
        }
      };
      const result = '{\n' +
        '  "processing": {\n' +
        '    "rules": [{\n' +
        '      "levels": ["L0", "L2"]\n' +
        '    }, {\n' +
        '      "levels": ["RAW", "L0", "L2"]\n' +
        '    }]\n' +
        '  }\n' +
        '}';
      expect(perfectJson(object, { singleLine: ({ key }) => key === 'levels' })).toEqual(result);
    });
  });
});
