const extractCategories = (categories, apiConnector) => {
  let output = []

  for (let categoryId of categories) {
      output.push({
        category_id: categoryId
      })
  }

  return output
}


const fill = async (source, { apiConnector, elasticClient }) => {

  let output = {
    "category_ids": source.categories,
    "entity_type_id": 4,
    "attribute_set_id": 11,
    "type_id": "simple",
    "sku": source.sku,
    "has_options": 0, // todo
    "required_options": 0,
    "created_at": new Date().getDate(),
    "updated_at": new Date().getDate(),
    "color": null,
    "gender": null,
    "material": 138,
    "luggage_size": null,
    "luggage_travel_style": null,
    "bag_luggage_type": 153,
    "jewelry_type": null,
    "status": 1,
    "accessories_size": null,
    "visibility": source.is_visible ? 4 : 0,
    "tax_class_id": source.tax_class_id,
    "is_recurring": false,
    "description": source.description,
    "meta_keyword": null,
    "short_description": "",
    "custom_layout_update": null,
    "accessories_type": "",
    "luggage_style": "",
    "name": source.name,
    "meta_title": null,
    "image": typeof (source.primary_image ==='Object') ? source.primary_image.standard_url : '',
    "custom_design": null,
    "gift_message_available": null,
    "small_image": "",
    "gift_wrapping_available": 0,
    "meta_description": null,
    "thumbnail": typeof (source.primary_image ==='Object') ? source.primary_image.thumbnail_url : '',
    "media_gallery": [{ image: source.primary_image.standard_url }],
    "gallery": null,
    "page_layout": "",
    "options_container": "",
    "url_key": source.custom_url,
    "country_of_manufacture": null,
    "msrp_enabled": 2,
    "msrp_display_actual_price_type": 4,
    "url_path": source.custom_url,
    "image_label": null,
    "small_image_label": null,
    "thumbnail_label": null,
    "gift_wrapping_price": null,
    "weight": source.weight,
    "price": source.price,
    "special_price": null,
    "msrp": null,
    "custom_design_from": null,
    "custom_design_to": null,
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
    }
  }

  console.log(output)
  return output;
}

module.exports = {
  fill
}