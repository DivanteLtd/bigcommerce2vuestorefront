const categoryTemplate = require('../templates/category')
const sendToElastic = require('../common/sendToElastic')


const importer = ({ config, elasticClient, apiConnector }) => {
  apiConnector(config.bc).get('/catalog/categories').then(
    (result) => {
      for (let category of result.data) {
        categoryTemplate.fill(category, { apiConnector, elasticClient, config }).then(converted => {
          sendToElastic(converted, 'category', { config, elasticClient })
        })
      }
    })

  function importCategories() {
    console.log('categories are being imported...')
  }

  return {
    importCategories
  }
}


module.exports = Object.freeze({
  importer
})