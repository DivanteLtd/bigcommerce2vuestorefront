const categoryTemplate = require('../templates/category')
const sendToElastic = require('../common/sendToElastic')


const importer = ({ config, elasticClient, apiConnector }) => {
  apiConnector(config.bc).get('/categories').then(
    (result) => {
      console.log(result)
      for (let category of result) {
        categoryTemplate.fill(category, { apiConnector, elasticClient }).then(converted => {
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