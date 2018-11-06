'use strict'

const config = require('./config')
const program = require('commander')
const productImporter = require('./src/importer/products')
const categoryImporter = require('./src/importer/categories')

program.command('products')
        .action((cmd)=> productImporter.importer(config.bc).importProducts())

program.command('categories')
  .action((cmd)=> categoryImporter.importer(config.bc).importCategories())

program
  .on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

program
  .parse(process.argv)