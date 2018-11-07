const config = require('../../config')

const extractSubcategories = async (parent_id, apiConnector) => {

  let parsed = await apiConnector(config.bc).get(`/catalog/categories?parent_id=${parent_id}`)
  let subcats = []
  if (parsed.length > 0) {
    for (let child of parsed) {

      let childData = {
        "entity_type_id": 3,
        "attribute_set_id": 0,
        "parent_id": parent_id,
        "created_at": "2018-10-12",
        "updated_at": "2018-10-12",
        "position": 0,
        "children_count": 1,
        "available_sort_by": null,
        "include_in_menu": 1,
        "name": child.name,
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
    name,
    parent,
    slug,

  } = source

  console.log(slug)
  let children = await extractSubcategories(parseInt(id), apiConnector)
  let output = {
    "entity_type_id": 3,
    "attribute_set_id": 0,
    "parent_id": parent,
    "created_at": "2018-10-12",
    "updated_at": "2018-10-12",
    "is_active": true,
    "position": 0,
    "level": 2,
    "children_count": children.length,
    "product_count": 1,
    "available_sort_by": null,
    "include_in_menu": 1,
    "name": name,
    "id": id,
    "children_data": children,
    "is_anchor": "1",
    "path": `1/${id}`,
    "url_key": slug
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