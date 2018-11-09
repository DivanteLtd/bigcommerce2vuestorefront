'use strict'

const config = require('./config')
const program = require('commander')
const productImporter = require('./src/importer/products')
const categoryImporter = require('./src/importer/categories')
const attributeImporter = require('./src/importer/attributes')

const BigCommerce = require('node-bigcommerce');
const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
})
const connector = (config) => {
    return new BigCommerce(config);
}

program.command('attributes')
  .action((cmd)=> attributeImporter.importer({ config: config, elasticClient: client, apiConnector: connector }).importAttributes())

program.command('products')
        .action((cmd)=> productImporter.importer({ config: config, elasticClient: client, apiConnector: connector }).importProducts())

program.command('categories')
  .action((cmd)=> categoryImporter.importer({ config: config, elasticClient: client, apiConnector: connector }).importCategories())

program
  .on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

program
  .parse(process.argv)