# First Progressive Web App (PWA) for BigCommerce
This projects bring You the BigCommerce support as a backend platform for [Vue Storefront - first Progressive Web App for e-Commerce](https://github.com/DivanteLtd/vue-storefront). 

Vue Storefront is a standalone PWA storefront for your eCommerce, possible to connect with any eCommerce backend (eg. Magento, Pimcore, WooCommerce, BigCommerce or Shopware) through the API.

[![See how it works!](/DivanteLtd/vue-storefront/raw/master/doc/media/Fil-Rakowski-VS-Demo-Youtube.png)](https://www.youtube.com/watch?v=L4K-mq9JoaQ)

Sign up for a demo at https://vuestorefront.io/.

# BigCommerce data bridge
Vue Storefront is platform agnostic - which mean: it can be connected to virtually any eCommerce CMS. This project is a data connector for *BigCommerce eCommerce Framework*.

This integration is currently at **Proof of Concept** stage and it's not ready for production deplyoment. 

Ready made features:
- Simple products support.
- Configurable product support,
- Media import,
- Configurable options,
- Product Variants

TODO:
- Custom product options,
- Customer account,
- Checkout + order,
- Shopping cart sync,
- Add on-demand indexation based on BigCommerce web-hooks,
- Add delta-main indexing scheme indexing records modified after ...

## Installation guide

First, please do install Vue Storefront. Here You can find the [official installation guide](https://divanteltd.github.io/vue-storefront/guide/installation/linux-mac.html). 

Requirements:
- Node 10,
- Yarn package manager

Then please execute the following steps:
```bash
git clone https://github.com/DivanteLtd/bigcommerce2vuestorefront.git
cd bigcommerce2vuestorefront
yarn install
```

Please do setup the BigCommerce [API credentials](https://developer.bigcommerce.com/api/#api-documentation) by editing `config.js`:

```js
module.exports = Object.freeze({
  bc: {
    clientId: rocess.env.BC_API_CLIENT_ID || 'atiyjoyxaq65lfjyrriu4q10m0599yn',
    secret: rocess.env.BC_API_SECRET || 'bwfdv6glwb72nhgpqd4nnikpdr9jiiv',
    accessToken: rocess.env.BC_API_ACCESS_TOKEN || 'mjhbzys8zcwjjdf3jjzsm57bt0w55ot',
    storeHash: rocess.env.BC_API_STORE_HASH ||'txjxffgep6',
    responseType: 'json',
    apiVersion: 'v3'
  },
  db: {
    driver: 'elasticsearch',
    url: process.env.DATABASE_URL || 'http://localhost:9200',
    indexName:  process.env.INDEX_NAME || 'vue_storefront_catalog'
  }
})
```

You can use the ENV variables instead:

```bash
export BC_API_CLIENT_ID=atiyjoyxaq65lfjyrriu4q10m0599yn
export BC_API_SECRET=bwfdv6glwb72nhgpqd4nnikpdr9jiiv
export BC_API_ACCESS_TOKEN=mjhbzys8zcwjjdf3jjzsm57bt0w55ot
export BC_API_STORE_HASH=txjxffgep6
node cli.js products
node cli.js categories
```

**Important note:** please do test this data bridge with Vue Storefront 1.6.

