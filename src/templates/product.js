const moment = require('moment')
const url = require('url');

const removeQueryString = (sourceUrl) => {
  // split url into distinct parts
  // (full list: https://nodejs.org/api/url.html#url_url_parse_urlstr_parsequerystring_slashesdenotehost)
  var obj = url.parse(sourceUrl);
  // remove the querystring
  obj.search = obj.query = "";
  // reassemble the url
  return url.format(obj);
}

const extractCategories = (categories, apiConnector) => {
  let output = []

  for (let categoryId of categories) {
      output.push({
        category_id: categoryId
      })
  }

  return output
}
const modifierOptions = async (product, { apiConnector, elasticClient, config }) => {
  return apiConnector(config.bc).get('/catalog/products/' + product.id + '/modifiers').catch(err => console.error(err))
}
const options = async (product, { apiConnector, elasticClient, config }) => {
  return apiConnector(config.bc).get('/catalog/products/' + product.id + '/options').catch(err => console.error(err))
}
const customFields = async (product, { apiConnector, elasticClient, config }) => {
  return apiConnector(config.bc).get('/catalog/products/' + product.id + '/custom-fields').catch(err => console.error(err))
}
const fill =  (source, { apiConnector, elasticClient, config }) =>  new Promise( (resolve, reject) => {
    let output = {
      "category_ids": source.categories,
      "entity_type_id": 4,
      "attribute_set_id": 11,
      "type_id": "simple", // TODO: add othe product types
      "sku": source.sku,
      "has_options": source.options && source.options.length > 0, // todo
      "required_options": 0,
      "created_at": moment(source.created_at).toJSON(),
      "updated_at": moment(source.updated_at).toJSON(),
      "status": 1,
      "accessories_size": null,
      "visibility": source.is_visible ? 4 : 0,
      "tax_class_id": source.tax_class_id,
      "is_recurring": false,
      "description": source.description,
      "meta_keyword": null,
      "short_description": "",
      "name": source.name,
      "meta_title": null,
      "image": source.images ? removeQueryString(source.images[0].url_standard) : '',
      "meta_description": null,
      "thumbnail": source.images ? removeQueryString(source.images[0].url_thumbnail) : '',
      "media_gallery": source.images ? source.images.map(si => {  return { image: removeQueryString(si.url_standard) } }) : null,
      "url_key": source.custom_url.url,
      "country_of_manufacture": null,
      "url_path": source.custom_url.url,
      "image_label": null,
      "small_image_label": null,
      "thumbnail_label": null,
      "gift_wrapping_price": null,
      "weight": source.weight,
      "price": source.price,
      "special_price": null,
      "msrp": null,
      "news_from_date": null,
      "news_to_date": null,
      "special_from_date": null,
      "special_to_date": null,
      "is_salable": true,
      "stock_item": {
        "is_in_stock": source.inventory_tracking === 'none' ? true : source.inventory_level > 0
      },
      "id": source.id,
      "category": extractCategories(source.categories),
      "stock":{
        "is_in_stock": true
      },
      "configurable_children": source.variants ? source.variants.map(sourceVariant => {
        let child = {
          "sku": sourceVariant.sku,
          "price": sourceVariant.price,
          "image": removeQueryString(sourceVariant.image_url),
          "is_salable": !sourceVariant.purchasing_disabled,
          "product_id": source.id
        }
        sourceVariant.option_values.map((ov) => {
          child['prodopt-' + ov.option_id] = ov.id // our convention is to store the product options as a attributes with the names = prodopt-{{option_id}}
        })
        return child
      }) : null
    }
    const subPromises = []
    subPromises.push(options(source, { apiConnector, elasticClient, config }).then(productOptions => {
      if (productOptions && productOptions.data.length >0) {
        output.type_id = "configurable"
        console.log(productOptions)
        output.configurable_options = productOptions.data.map(po => {
          return { // TODO: we need to populate product's : product.color_options and product.size_options to make forntend filters work properly
            id: po.id,// TODO: LETS STORE THE ATTRIBUTES DICTIONARY JUST FOR attr config / type - we don't need the available options (which is risky updating Elastic)
            attribute_code: 'prodopt-' + po.id,
            product_id: output.id,
            label: po.display_name,
            position: po.sort_order,
            frontend_label: po.display_name,
            values: po.option_values.map(ov => {
              return {
                label: ov.label,
                default_label: ov.label,
                order: ov.sort_order,
                value_index: ov.id,
                value_data: ov.value_data
              }
            })
          }
        })
      }
    }))
    // TODO: we need to get custom_attributes for products and store it to product.custom_attributes { attribute_code, value }
    subPromises.push(customFields(source, { apiConnector, elasticClient, config }).then(productCustomFields => {
      if (productCustomFields && productCustomFields.data.length >0) {
        output.custom_attributes = productCustomFields.data.map(po => {
          return {
            attribute_code: po.name,
            value: po.value,
            label: po.name
          }
        })
      }
    }))

    // TODO: BigCommerce's modifier_options => Magento's custom_options
    subPromises.push(modifierOptions(source, { apiConnector, elasticClient, config }))


    Promise.all(subPromises).then((results) => {
        // console.log(output)
        console.log('Product ' + output.name + ' - ' + output.sku + ' ' + output.type_id +': imported!')
              
        resolve(output)
      }
    )
})

module.exports = {
  fill
}