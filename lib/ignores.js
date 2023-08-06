import fs from 'fs';
const readIgnores = (ignoreFile, separator) => {
  if (!fs.existsSync(ignoreFile)) return new Map();

  try {
    return fs
      .readFileSync(ignoreFile, {encoding: 'utf8', flag: 'r'})
      .split(/[\n\r]/)
      .reduce(
        (state, line, index, lines) => {
          const clean = line.trim();
          if (clean === separator) {
            state.current.forEach(k => {
              state.ignores.set(k, state.current);
            });
            state.current = [];
          } else if (clean.length) {
            state.current.push(clean);
          }
          return state;
        },
        {ignores: new Map(), current: []},
      ).ignores;
  } catch (e) {
    console.warn(`Failed to read ignore file ${ignoreFile}: ${e.message}`);
    return new Map();
  }
};

export {readIgnores}
