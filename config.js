module.exports = Object.freeze({
  bc: {
    clientId: process.env.BC_API_CLIENT_ID || 'atiyjoyxaq65lfjyrriu4q10m0599yn',
    secret: process.env.BC_API_SECRET || 'bwfdv6glwb72nhgpqd4nnikpdr9jiiv',
    accessToken: process.env.BC_API_ACCESS_TOKEN || 'mjhbzys8zcwjjdf3jjzsm57bt0w55ot',
    storeHash: process.env.BC_API_STORE_HASH ||'txjxffgep6',
    responseType: 'json',
    apiVersion: 'v3'
  },
  db: {
    driver: 'elasticsearch',
    url: process.env.DATABASE_URL || 'http://localhost:9200',
    indexName:  process.env.INDEX_NAME || 'vue_storefront_catalog'
  }
})
