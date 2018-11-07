const productTemplate = require('../templates/product')
const sendToElastic = require('../common/sendToElastic.js')


const importer = ({ config, elasticClient, apiConnector }) => {
  apiConnector(config.bc).get('/catalog/products?include=variants,images').then(
    (result) => {
      for (let product of result.data) {
          productTemplate.fill(product, { apiConnector, elasticClient, config }).then(converted => {
            sendToElastic(converted, 'product', { config, elasticClient })
          })
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