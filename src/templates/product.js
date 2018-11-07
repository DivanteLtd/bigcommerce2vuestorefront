const moment = require('moment')
const extractCategories = (categories, apiConnector) => {
  let output = []

  for (let categoryId of categories) {
      output.push({
        category_id: categoryId
      })
  }

  return output
}

const options = async (product, { apiConnector, elasticClient, config }) => {
  return apiConnector(config.bc).get('/catalog/products/' + product.id + '/options').catch(err => console.error(err))
}

const fill = async (source, { apiConnector, elasticClient, config }) => {
  let output = {
    "category_ids": source.categories,
    "entity_type_id": 4,
    "attribute_set_id": 11,
    "type_id": source.variants && source.variants.length > 0 ? "configurable" : "simple", // TODO: add othe product types
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
    "image": source.images ? source.images[0].url_standard : '',
    "meta_description": null,
    "thumbnail": source.images ? source.images[0].url_thumbnail : '',
    "media_gallery": source.images ? source.images.map(si => {  return { image: si.url_standard } }) : null,
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
      return {
        "sku": sourceVariant.sku,
        "price": sourceVariant.price,
        "image": sourceVariant.image_url,
        "is_salable": !sourceVariant.purchasing_disabled,
        "product_id": source.id
      }
    }) : null
  }
  const productOptions = await options(source, { apiConnector, elasticClient, config })
  if (productOptions && productOptions.data.length >0) {
    output.configurable_options = productOptions.data.map(po => {
      return {
        id: po.id,// TODO: we need attribute_id + attribute_code here
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
  console.log(productOptions)
  console.log(source)
  console.log(output)
  
  return output;
}

module.exports = {
  fill
}