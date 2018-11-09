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

module.exports = removeQueryString