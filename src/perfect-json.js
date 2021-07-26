export default function perfectJson(item, options = {}, recursiveOptions = {}) {
  const { indent = 2, compact = true, singleLine, maxLineLength, arrayMargin = '', objectMargin = ' ' } = options;
  const { key, path = [], items = [], depth = 0 } = recursiveOptions;

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

  let open;
  let close;
  let margin;
  let values;

  const baseIndentChars = new Array(depth * indent + 1).join(' ');
  const globalIndentChars = new Array((depth + 1) * indent + 1).join(' ');
  const prefixIndentChars = key === undefined ? baseIndentChars : '';

  const perfectify = (key, value) => perfectJson(value, options, {
    key,
    path: path.concat([key]),
    items: items.concat([item]),
    depth: depth + 1
  });

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
  if (
    (typeof singleLine === 'boolean' && singleLine) ||
    (typeof singleLine === 'function' && singleLine({ key, value: item, path, items, line, depth, indent })) ||
    (typeof maxLineLength === 'number' && line.length + baseIndentChars.length <= maxLineLength)
  ) {
    return line;
  }

  let list;
  if (Array.isArray(item) && arrayValuesAreExpandedObjects(values) && compact) {
    const replaceRegExp = new RegExp(`\\n {${indent}}`, 'g');
    list = '';
    for (let i = 0; i < values.length; i++) {
      if (list) {
        list += ', ';
      }
      list += values[i].replace(replaceRegExp, '\n');
    }
  }
  else {
    list = `\n${values.map(value => `${globalIndentChars}${value}`).join(',\n')}\n${baseIndentChars}`;
  }

  return `${prefixIndentChars}${open}${list}${close}`;
}

function arrayValuesAreExpandedObjects(values) {
  for (let i = 0; i < values.length; i++) {
    if (!/^[[{]\n/.test(values[i])) {
      return false;
    }
  }
  return true;
}
