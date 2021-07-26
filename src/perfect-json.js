export default function perfectJson(item, options = {}, recursiveOptions = {}) {
  const {
    indent = 2, compact = true, singleLine, maxLineLength,
    arrayMargin = '', objectMargin = ' ', split, splitResult
  } = options;

  const { key, path = [], items = [], depth = 0, splitted = {} } = recursiveOptions;

  if (item === undefined) {
    return 'undefined';
  }
  if (item === null) {
    return 'null';
  }
  if (typeof item === 'string') {
    return `"${item}"`;
  }
  if (typeof item === 'boolean' || typeof item === 'number') {
    return `${item}`;
  }

  const perfectify = (key, value) => perfectJson(value, options, {
    key,
    path: path.concat([key]),
    items: items.concat([item]),
    depth: depth + 1,
    splitted
  });

  const baseIndentChars = getIndentChars(depth, indent);
  const nestedIndentChars = getIndentChars(depth + 1, indent);
  const prefixIndentChars = key === undefined ? baseIndentChars : '';

  let open, close, margin, values;
  if (Array.isArray(item)) {
    if (item.length === 0) {
      return `${prefixIndentChars}[]`;
    }
    open = '[';
    close = ']';
    margin = arrayMargin;
    values = item.map((value, key) => perfectify(key, value));
  }
  else {
    const keys = Object.keys(item);
    if (keys.length === 0) {
      return `${prefixIndentChars}{}`;
    }
    open = '{';
    close = '}';
    margin = objectMargin;
    values = keys.map(key => `"${key}": ${perfectify(key, item[key])}`);
  }

  const line = `${open}${margin}${values.join(', ')}${margin}${close}`;
  const itemOpts = { key, value: item, path, items, line, depth, indent };
  const splitPlaceholder = typeof key === 'string' && typeof split === 'function' ? split(itemOpts) : null;
  if (splitted[splitPlaceholder] !== undefined) {
    throw new Error(`Placeholder "${splitPlaceholder}" is already used`);
  }

  let result;
  if (
    (typeof singleLine === 'boolean' && singleLine) ||
    (typeof singleLine === 'function' && singleLine({ key, value: item, path, items, line, depth, indent })) ||
    (typeof maxLineLength === 'number' && line.length + baseIndentChars.length <= maxLineLength)
  ) {
    result = line;
  }
  else {
    let list;
    if (Array.isArray(item) && arrayValuesAreExpandedObjects(values) && compact) {
      const replaceIndent = splitPlaceholder ? (depth + 1) * indent : indent;
      const replaceRegExp = new RegExp(`\\n {${replaceIndent}}`, 'g');
      list = '';
      for (let i = 0; i < values.length; i++) {
        if (list) {
          list += ', ';
        }
        list += values[i].replace(replaceRegExp, '\n');
      }
    }
    else {
      const baseSpace = splitPlaceholder ? '' : baseIndentChars;
      const nestedSpace = splitPlaceholder ? getIndentChars(1, indent) : nestedIndentChars;
      list = `\n${values.map(value => `${nestedSpace}${value}`).join(',\n')}\n${baseSpace}`;
    }
    result = `${prefixIndentChars}${open}${list}${close}`;
  }

  if (splitPlaceholder) {
    splitted[splitPlaceholder] = result;
  }
  if (depth === 0 && typeof splitResult === 'function') {
    splitResult(splitted);
  }
  return splitPlaceholder ? `"${splitPlaceholder}"` : result;
}

function arrayValuesAreExpandedObjects(values) {
  for (let i = 0; i < values.length; i++) {
    if (!/^[[{]\n/.test(values[i])) {
      return false;
    }
  }
  return true;
}

function getIndentChars(depth, indent) {
  return new Array(depth * indent + 1).join(' ');
}
