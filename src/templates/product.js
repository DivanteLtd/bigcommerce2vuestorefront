const moment = require('moment')
const removeQueryString = require('../common/removeQueryString')

const trim = (s, t) => {
  var tr, sr
  tr = t.split('').map(e => `\\\\${e}`).join('')
  sr = s.replace(new RegExp(`^[${tr}]+|[${tr}]+$`, 'g'), '')
  return sr
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
    const filter_options = {}
    let output = {
      "category_ids": source.categories,
      "type_id": "simple", // TODO: add othe product types
      "sku": source.sku,
      "has_options": source.options && source.options.length > 0, // todo
      "required_options": 0,
//      "created_at": moment(source.created_at).toJSON(),
//      "updated_at": moment(source.updated_at).toJSON(),
      "status": 1,
      "visibility": source.is_visible ? 4 : 0,
      "tax_class_id": source.tax_class_id,
      "description": source.description,
      "name": source.name,
      "image": source.images ? removeQueryString(source.images[0].url_standard) : '',
      "thumbnail": source.images ? removeQueryString(source.images[0].url_thumbnail) : '',
      "media_gallery": source.images ? source.images.map(si => {  return { image: removeQueryString(si.url_standard) } }) : null,
      "url_key": trim(source.custom_url.url, '/'),
      "url_path": trim(source.custom_url.url, '/'),
      "weight": source.weight,
      "price": source.price,
      "special_price": null,
      "news_from_date": null,
      "news_to_date": null,
      "special_from_date": null,
      "special_to_date": null,
      "stock_item": {
        "is_in_stock": source.inventory_tracking === 'none' ? true : source.inventory_level > 0
      },
      "id": source.id,
      "category": extractCategories(source.categories),
      "stock":{ // TODO: Add stock quantity - real numbers
        "is_in_stock": true
      },
      "configurable_children": source.variants ? source.variants.map(sourceVariant => {
        let child = {
          "sku": sourceVariant.sku,
          "price": sourceVariant.price ? sourceVariant.price : source.price,
          "image": removeQueryString(sourceVariant.image_url),
          "is_salable": !sourceVariant.purchasing_disabled,
          "product_id": source.id
        }
        sourceVariant.option_values.map((ov) => {
          if (!filter_options[ov.option_display_name + '_options']) filter_options[ov.option_display_name + '_options'] = new Set() // we need to aggregate the options from child items
          filter_options[ov.option_display_name + '_options'].add(ov.label)
          child[ov.option_display_name] = ov.label
          child['prodopt-' + ov.option_id] = ov.id // our convention is to store the product options as a attributes with the names = prodopt-{{option_id}}
        })
        return child
      }) : null
    }
    for (let key in filter_options) {
      output[key] = Array.from(filter_options[key])
    }
    const subPromises = []
    subPromises.push(options(source, { apiConnector, elasticClient, config }).then(productOptions => {
      if (productOptions && productOptions.data.length >0) {
        output.type_id = "configurable"
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
        output[po.name] = po.value
      }
    }))

    // TODO: BigCommerce's modifier_options => Magento's custom_options
    subPromises.push(modifierOptions(source, { apiConnector, elasticClient, config }))


    Promise.all(subPromises).then((results) => {
        // console.log(output)
        console.log('Product ' + output.name + ' - ' + output.sku + ' ' + output.type_id + ' - price: ' + output.price + ': imported!')
              
        resolve(output)
      }
    )
})

module.exports = {
  fill
}