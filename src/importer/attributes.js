const attributeTemplate = require('../templates/attribute')
const sendToElastic = require('../common/sendToElastic')


const importer = ({ config, elasticClient, apiConnector }) => {
  apiConnector(config.bc).getAsync('products/attributes?per_page=100').then(
    (result) => {
      let body = result.toJSON().body
      let array = JSON.parse(body)
      for (let product of array) {
        attributeTemplate.fill(product).then(converted => sendToElastic(converted, 'attribute', { config, elasticClient }))
      }
    })

  function importAttributes() {
    console.log('attributes are being imported...')
  }

  return {
    importAttributes
  }
}


module.exports = Object.freeze({
  importer
})