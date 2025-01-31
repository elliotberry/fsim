import fs from 'fs';
import path from 'path';
import {dice} from './dice.js';
import {reviverMap, replacerMap} from './map.js'
import {readIgnores} from './ignores.js';

const IGNORE_FILE = '.fsimignore';
const CACHE_FILE = '.fsimcache';

var bigrams = new Map();


const initFileCache = (dir, cacheFile, cacheEnabled) => {
  let bigrams = new Map();
  const fileCache = path.join(dir, cacheFile);
  if (cacheEnabled && fs.existsSync(fileCache)) {
    try {
      bigrams = new Map(JSON.parse(fs.readFileSync(fileCache, {encoding: 'utf8', flag: 'r'}), reviverMap));
    } catch (e) {
      console.warn(`Failed to read cache file ${fileCache}: ${e.message}`);
      
    }
  }
  return {bigrams, fileCache};
};

const writeToFileCache = (fileCache, bigrams, cacheEnabled) => {
  if (cacheEnabled) {
    try {
      fs.writeFileSync(fileCache, JSON.stringify(bigrams, replacerMap), {encoding: 'utf8', flag: 'w'});
    } catch (e) {
      console.warn(`Failed to write cache file ${fileCache}: ${e.message}`);
    }
  }
};

const fsim = function (options) {
  const {dir, recursive, minRating, cache, separator} = options;
  let {bigrams, fileCache} = initFileCache(dir, CACHE_FILE, cache);

  const ignores = readIgnores(path.join(dir, IGNORE_FILE), separator);
  const results = [];
  const files = getFiles(dir, recursive, path.normalize(dir + path.sep));
  
  files.forEach(file => {
    files.delete(file.filepath);
    const matches = findSimilar(file, files, minRating, ignores);
    if (matches.length) {
      results.push(Array(file.filepath).concat(matches.map(match => match.filepath)));
    }
  });
  writeToFileCache(fileCache, bigrams, cache);

  return results;
};

const stripExtension = filePath => {
  const basename = path.basename(filePath);
  const extension = path.extname(basename);
  return basename.slice(0, -extension.length);
};

const findSimilar = (ref, files, minRating, ignores) => {
  const ignore = (ignores && ignores.get(ref.filepath)) ?? [];

  // Find similar files to the reference:
  return (
    Array.from(files.values())
      // 1. Filter out ignored files
      .filter(file => !ignore.includes(file.filepath))
      // 2. Calculate distance between reference and candidate
      .map(file => {
        return {...file, rating: dice(ref.filename, file.filename, bigrams)};
      })
      // 3. filter out results < threshold
      .filter(file => file.rating > minRating)
      // 4. Remove results from active set before recursing.
      .map(file => {
        files.delete(file.filepath);
        return file;
      })
      // 5. Recurse on each result to aggregate similars.
      .reduce((matches, file) => {
        matches.push(file);
        return matches.concat(findSimilar(file, files, minRating, ignores));
      }, [])
  );
};

const getFiles = (dir, recursive, prefix) => {
  return fs.readdirSync(dir).reduce((files, file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (recursive) {
        return new Map([...files, ...getFiles(filepath, recursive, prefix)]);
      }
    } else {
      const relpath = filepath.replace(prefix, '');
      files.set(relpath, {
        filepath: relpath,
        filename: stripExtension(file),
      });
    }
    return files;
  }, new Map());
};

export default fsim;