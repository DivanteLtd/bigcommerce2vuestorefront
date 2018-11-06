const BigCommerce = require('node-bigcommerce');
const categoryTemplate = require('../templates/category')
const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})

const connector = (config) => {
  return new BigCommerce(config);
}

const sendToElastic = async category => {
  try {
    await client.create({
      index: 'vue_storefront_catalog',
      type: 'category',
      id: category.id,
      body: category
    })
  } catch (e) {
    if (e.status === 409) { // document already exists; force update.
      await client.update({
        index: 'vue_storefront_catalog',
        type: 'category',
        id: category.id,
        body: {
          doc: category
        }
      })
    }
  }
}





const importer = (config) => {
  connector(config).get('/categories').then(
    (result) => {
      console.log(result)
      for (let category of result) {
          categoryTemplate.fill(category).then(done => {
            //console.log(done)
            console.log(done)
               sendToElastic(done)

          })
      }
    })

  function importCategories() {
    console.log('produts are being imported...')
  }

  return {
    importCategories
  }
}


module.exports = Object.freeze({
  importer
})