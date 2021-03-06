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
      checkJson(perfectJson(object), [
        '{',
        '  "name": "RESURS",',
        '  "orbit": 5000,',
        '  "remoteSensing": true',
        '}'
      ]);
    });

    it('object at single line', () => {
      const result = '{ "name": "RESURS", "orbit": 5000, "remoteSensing": true }';
      expect(perfectJson(object, { singleLine: true })).toEqual(result);
    });

    it('array at multiple lines', () => {
      checkJson(perfectJson(array), [
        '[',
        '  "PAN",',
        '  "MS",',
        '  "PMS"',
        ']'
      ]);
    });

    it('at single line', () => {
      const result = '["PAN", "MS", "PMS"]';
      expect(perfectJson(array, { singleLine: true })).toEqual(result);
    });

    it('undefined and null values', () => {
      checkJson(perfectJson({ undefined: undefined, null: null }), [
        '{',
        '  "undefined": undefined,',
        '  "null": null',
        '}'
      ]);
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
      checkJson(perfectJson(object), [
        '{',
        '  "level": "L2",',
        '  "metadata": {',
        '    "bandCombinations": [',
        '      "PAN",',
        '      "MS",',
        '      "PMS"',
        '    ],',
        '    "cloudMask": true',
        '  }',
        '}'
      ]);
    });

    it('nested array on single line', () => {
      checkJson(perfectJson(object, {
        singleLine: ({ key, depth }) => key === 'bandCombinations' && depth === 2
      }), [
        '{',
        '  "level": "L2",',
        '  "metadata": {',
        '    "bandCombinations": ["PAN", "MS", "PMS"],',
        '    "cloudMask": true',
        '  }',
        '}'
      ]);
    });

    it('nested object on single line', () => {
      checkJson(perfectJson(object, {
        singleLine: ({ key }) => key === 'metadata' || key === 'bandCombinations'
      }), [
        '{',
        '  "level": "L2",',
        '  "metadata": { "bandCombinations": ["PAN", "MS", "PMS"], "cloudMask": true }',
        '}'
      ]);
    });

    it('restrict single line by max length', () => {
      checkJson(perfectJson(object, { maxLineLength: 80 }), [
        '{',
        '  "level": "L2",',
        '  "metadata": { "bandCombinations": ["PAN", "MS", "PMS"], "cloudMask": true }',
        '}'
      ]);
      checkJson(perfectJson(object, { maxLineLength: 40 }), [
        '{',
        '  "level": "L2",',
        '  "metadata": {',
        '    "bandCombinations": ["PAN", "MS", "PMS"],',
        '    "cloudMask": true',
        '  }',
        '}'
      ]);
    });
  });

  describe('advanced', () => {
    const array = [
      { name: 'RESURS', orbit: 5000 },
      { name: 'KANOPUS', orbit: 2250 },
      { name: 'METEOR', orbit: 1750 }
    ];

    const object = {
      processing: {
        rules: [{
          levels: ['L0', 'L2']
        }, {
          levels: ['RAW', 'L0', 'L2']
        }]
      }
    };

    it('array of objects', () => {
      checkJson(perfectJson(array), [
        '[{',
        '  "name": "RESURS",',
        '  "orbit": 5000',
        '}, {',
        '  "name": "KANOPUS",',
        '  "orbit": 2250',
        '}, {',
        '  "name": "METEOR",',
        '  "orbit": 1750',
        '}]'
      ]);
    });

    it('incompact array of objects', () => {
      checkJson(perfectJson(array, { compact: false }), [
        '[',
        '  {',
        '    "name": "RESURS",',
        '    "orbit": 5000',
        '  },',
        '  {',
        '    "name": "KANOPUS",',
        '    "orbit": 2250',
        '  },',
        '  {',
        '    "name": "METEOR",',
        '    "orbit": 1750',
        '  }',
        ']'
      ]);
    });

    it('nested array of objects', () => {
      checkJson(perfectJson(object, { singleLine: ({ key }) => key === 'levels' }), [
        '{',
        '  "processing": {',
        '    "rules": [{',
        '      "levels": ["L0", "L2"]',
        '    }, {',
        '      "levels": ["RAW", "L0", "L2"]',
        '    }]',
        '  }',
        '}'
      ]);
    });

    it('nested incompact array of objects', () => {
      checkJson(perfectJson(object, { compact: false, singleLine: ({ key }) => key === 'levels' }), [
        '{',
        '  "processing": {',
        '    "rules": [',
        '      {',
        '        "levels": ["L0", "L2"]',
        '      },',
        '      {',
        '        "levels": ["RAW", "L0", "L2"]',
        '      }',
        '    ]',
        '  }',
        '}'
      ]);
    });
  });

  describe('splitting', () => {
    it('basic', () => {
      const object = {
        name: 'Dmitriy',
        surname: 'Pushkov',
        skills: ['JavaScript', 'Node.js', 'ES6'],
        env: { node: '14.0.0', eslint: true, babel: true, typescript: false }
      };
      const split = ({ key, depth }) => {
        if (depth !== 1) {
          return null;
        }
        switch (key) {
          case 'skills': return '#skills';
          case 'env': return '#env';
          default: return null;
        }
      };
      const splitResult = jest.fn().mockImplementation(splitted => {
        const { '#skills': skillsJson, '#env': envJson } = splitted;
        checkJson(skillsJson, [
          '[',
          '  "JavaScript",',
          '  "Node.js",',
          '  "ES6"',
          ']'
        ]);
        checkJson(envJson, [
          '{',
          '  "node": "14.0.0",',
          '  "eslint": true,',
          '  "babel": true,',
          '  "typescript": false',
          '}'
        ]);
      });
      checkJson(perfectJson(object, { split, splitResult }), [
        '{',
        '  "name": "Dmitriy",',
        '  "surname": "Pushkov",',
        '  "skills": "#skills",',
        '  "env": "#env"',
        '}'
      ]);
      checkSplitResult(splitResult, ['#skills', '#env']);
    });

    it('deep', () => {
      const object = {
        user: {
          profile: {
            name: 'Dmitriy',
            surname: 'Pushkov'
          }
        }
      };
      const split = ({ key, depth }) => {
        return depth === 2 && key === 'profile' ? '#profile' : null;
      };
      const splitResult = jest.fn().mockImplementation(splitted => {
        const { '#profile': profileJson } = splitted;
        checkJson(profileJson, [
          '{',
          '  "name": "Dmitriy",',
          '  "surname": "Pushkov"',
          '}'
        ]);
      });
      checkJson(perfectJson(object, { split, splitResult }), [
        '{',
        '  "user": {',
        '    "profile": "#profile"',
        '  }',
        '}'
      ]);
      checkSplitResult(splitResult, ['#profile']);
    });

    it('array of objects', () => {
      const object = {
        source: {
          languages: [
            { id: 'javascript', name: 'JavaScript' },
            { id: 'typescript', name: 'TypeScript' },
            { id: 'node', name: 'Node.js' }
          ]
        }
      };
      const split = ({ key, depth }) => {
        return depth === 2 && key === 'languages' ? '#languages' : null;
      };
      const splitResult = jest.fn().mockImplementation(splitted => {
        const { '#languages': languagesJson } = splitted;
        checkJson(languagesJson, [
          '[{',
          '  "id": "javascript",',
          '  "name": "JavaScript"',
          '}, {',
          '  "id": "typescript",',
          '  "name": "TypeScript"',
          '}, {',
          '  "id": "node",',
          '  "name": "Node.js"',
          '}]'
        ]);
      });
      checkJson(perfectJson(object, { split, splitResult }), [
        '{',
        '  "source": {',
        '    "languages": "#languages"',
        '  }',
        '}'
      ]);
      checkSplitResult(splitResult, ['#languages']);
    });

    it('nested', () => {
      const object = {
        products: {
          overwrite: true,
          quality: {
            rejectOnError: false,
            nested: {
              strict: false,
              rules: [{
                conditions: { satellite: 'RESURS' },
                status: 'good',
                enabled: false
              }, {
                conditions: { sensor: 'GEOTON' },
                status: 'bad',
                enabled: true
              }]
            }
          }
        }
      };
      const split = ({ key, depth }) => {
        if (depth === 2 && key === 'quality') {
          return '#quality';
        }
        if (depth === 4 && key === 'rules') {
          return '#rules';
        }
        return null;
      };
      const splitResult = jest.fn().mockImplementation(splitted => {
        const { '#quality': qualityJson, '#rules': rulesJson } = splitted;
        checkJson(qualityJson, [
          '{',
          '  "rejectOnError": false,',
          '  "nested": {',
          '    "strict": false,',
          '    "rules": "#rules"',
          '  }',
          '}'
        ]);
        checkJson(rulesJson, [
          '[{',
          '  "conditions": {',
          '    "satellite": "RESURS"',
          '  },',
          '  "status": "good",',
          '  "enabled": false',
          '}, {',
          '  "conditions": {',
          '    "sensor": "GEOTON"',
          '  },',
          '  "status": "bad",',
          '  "enabled": true',
          '}]'
        ]);
      });
      checkJson(perfectJson(object, { split, splitResult }), [
        '{',
        '  "products": {',
        '    "overwrite": true,',
        '    "quality": "#quality"',
        '  }',
        '}'
      ]);
      checkSplitResult(splitResult, ['#quality', '#rules']);
    });

    it('duplicate placeholder', () => {
      expect(() => {
        perfectJson({
          languages: ['JavaScript', 'TypeScript'],
          nested: {
            languages: ['JavaScript', 'TypeScript']
          }
        }, {
          split: ({ key }) => key === 'languages' ? '#languages' : null
        });
      }).toThrowError('Placeholder "#languages" is already used');
    });
  });
});

function checkJson(actual, expected) {
  expect(actual).toEqual(expected.join('\n'));
}

function checkSplitResult(splitResult, expectedPlaceholders) {
  expect(splitResult).toHaveBeenCalledTimes(1);
  const placeholders = Object.keys(splitResult.mock.calls[0][0]);
  expect(difference(expectedPlaceholders, placeholders)).toHaveLength(0);
}

function difference(array1, array2) {
  const diff = [];
  array1.forEach(item => {
    if (!array2.includes(item)) {
      diff.push(item);
    }
  });
  return diff;
}
