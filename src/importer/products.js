const BigCommerce = require('node-bigcommerce');
const productTemplate = require('../templates/product')
const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})

const connector = (config) => {
  return new BigCommerce(config);
}

const sendToElastic = async product => {
  try {
    await client.create({
      index: 'vue_storefront_catalog',
      type: 'product',
      id: product.id,
      body: product
    })
  } catch (e) {
    if (e.status === 409) { // document already exists; force update.
      await client.update({
        index: 'vue_storefront_catalog',
        type: 'product',
        id: product.id,
        body: {
          doc: product
        }
      })
    }
  }
}




const convert = (source) => {
  return productTemplate.fill(source)
}

const importer = (config) => {
  connector(config).get('/products').then(
    (result) => {
      for (let product of result) {
          let converted = convert(product)
          sendToElastic(converted)
      }
    })

  function importProducts() {
    console.log('produts are being imported...')
  }

  return {
    importProducts
  }
}


module.exports = Object.freeze({
  importer
})