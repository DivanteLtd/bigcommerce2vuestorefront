const config = require('../../config')
const removeQueryString = require('../common/removeQueryString')

const extractSubcategories = async (parent_id, apiConnector) => {

  let parsed = await apiConnector(config.bc).get(`/catalog/categories?parent_id=${parent_id}`)
  let subcats = []
  if (parsed.length > 0) {
    for (let child of parsed) {

      let childData = {
        "parent_id": parent_id,
        "position": child.sort_order,
        "children_count": 1,// TODO: update children count
        "include_in_menu": 1,
        "name": child.name,
        "url_key": child.custom_url ? removeQueryString(child.custom_url.url) : '',
        "id": child.id,
        "children_data": child.id !== parent_id && await extractSubcategories(child.id, apiConnector)
      }
      subcats.push(childData)
    }
  }

  return subcats

}



const fill = async (source, { apiConnector, elasticClient }) => {

  let {
    id,
    description,
    is_visible,
    name,
    parent_id,
    custom_url,
    sort_order

  } = source
  let children = await extractSubcategories(parseInt(id), apiConnector)
  let output = {
    "parent_id": parent_id,
    "is_active": is_visible,
    "position": sort_order,
    "level": 2, // level 1 = root category
    "children_count": children.length,
    "product_count": 1, // TODO: update this value properly
    "available_sort_by": null,
    "include_in_menu": 1,
    "name": name,
    "id": id,
    "children_data": children,
    "path": `1/${id}`,
    "url_key": removeQueryString(custom_url.url)
  };

  /*let childrenData =

  if (childrenData) {
    output.children_data = childrenData
  }*/

  return output;
}

module.exports = {
  fill
}