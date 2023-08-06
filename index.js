#!/usr/bin/env node
import path from 'path';
import fsim from './lib/fsim.js';  
import yargs from 'yargs/yargs';


//default values
const SEPARATOR = '--';
const MIN_RATING = 0.7;




var argv = yargs(process.argv.slice(2))
  .usage(`Usage: ${path.basename(process.argv[1])} /path/to/files`)
  .option('r', {
    alias: 'recursive',
    describe: 'recurse into subdirectories (default: recursion)',
    type: 'boolean',
    default: true,
  })
  .option('m', {
    alias: 'minimum',
    describe: `minimum similarity rating between 0.0 and 1.0 (default: ${MIN_RATING})`,
    type: 'number',
    default: MIN_RATING,
  })
  .option('s', {
    alias: 'separator',
    describe: `separator between similar sets (default: ${SEPARATOR})`,
    type: 'string',
    default: SEPARATOR,
  })
  .option('c', {
    alias: 'cache',
    describe: 'use a per-directory cache of bigrams (default: no cache)',
    type: 'boolean',
    default: false,
  })
  .help('h')
  .alias('h', 'help')
  .version(false)
  .argv;


const results = fsim({
  dir: argv._[0],
  minRating: argv.minimum,
  separator: argv.separator,
  cache: argv.cache,
  recursive: argv.recursive,
});

results.forEach(result => {
  result.forEach(file => {
    console.log(file);
  });
  console.log(argv.separator);
});
