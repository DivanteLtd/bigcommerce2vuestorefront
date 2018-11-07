const sendToElastic = async (object, entityName, { config, elasticClient }) => {
    try {
      await elasticClient.create({
        index: config.db.indexName,
        type: entityName,
        id: object.id,
        body: object
      })
    } catch (e) {
      if (e.status === 409) { // document already exists; force update.
        await elasticClient.update({
          index: config.db.indexName,
          type: entityName,
          id: object.id,
          body: {
            doc: object
          }
        })
      }
    }
  }

  module.exports = sendToElastic