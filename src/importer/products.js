const productTemplate = require('../templates/product')
const sendToElastic = require('../common/sendToElastic.js')


const importer = ({ config, elasticClient, apiConnector }) => {
  const baseUrl = '/catalog/products?include=variants,images'
  
  const fetchApi = (url) => {
    return apiConnector(config.bc).get(url).then(
    (result) => {
      for (let product of result.data) {
          productTemplate.fill(product, { apiConnector, elasticClient, config }).then(converted => {
            sendToElastic(converted, 'product', { config, elasticClient })
          })
        }
        if (result.meta.pagination.links.next) {
          console.log('Switching the page to ' + result.meta.pagination.links.next)
          fetchApi(baseUrl + result.meta.pagination.links.next)
        }
    })
  }
  fetchApi(baseUrl).catch(err => console.error(err))

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