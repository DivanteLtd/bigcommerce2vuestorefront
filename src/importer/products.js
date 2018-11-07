const productTemplate = require('../templates/product')
const sendToElastic = require('../common/sendToElastic.js')


const importer = ({ config, elasticClient, apiConnector }) => {
  apiConnector(config.bc).get('/products').then(
    (result) => {
      for (let product of result) {
          productTemplate.fill(product, { apiConnector, elasticClient }).then(converted => {
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