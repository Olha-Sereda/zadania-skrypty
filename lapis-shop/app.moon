lapis = require "lapis"
import json_params from require "lapis.application"
validate = require "lapis.validate"
cjson = require "cjson"
Category = require "models.Category"
Product = require "models.Product"

app = lapis.Application!

not_found = -> status: 404, json: {error: "not found"}

cat_json = (c) -> id: c.id, name: c.name

prod_json = (p) ->
  {
    id: p.id
    name: p.name
    price: tonumber p.price
    category_id: p.category_id
  }

jsonify = (list, fn) ->
  out = setmetatable {}, cjson.empty_array_mt
  for i, item in ipairs list
    out[i] = fn item
  out

app\get "/", =>
  json: {
    service: "lapis-shop"
    stage: "4.0"
    endpoints: {
      "GET    /api/categories"
      "POST   /api/categories"
      "GET    /api/categories/:id"
      "PUT    /api/categories/:id"
      "DELETE /api/categories/:id"
      "GET    /api/products"
      "POST   /api/products"
      "GET    /api/products/:id"
      "PUT    /api/products/:id"
      "DELETE /api/products/:id"
    }
  }

app\get "/api/categories", =>
  json: jsonify Category\select("order by id"), cat_json

app\post "/api/categories", json_params =>
  errs = validate.validate @params, {
    {"name", exists: true, min_length: 1, max_length: 100}
  }
  return status: 422, json: {errors: errs} if errs
  c = Category\create name: @params.name
  status: 201, json: cat_json c

app\get "/api/categories/:id", =>
  id = tonumber @params.id
  c = id and Category\find id
  return not_found! unless c
  json: cat_json c

app\put "/api/categories/:id", json_params =>
  id = tonumber @params.id
  c = id and Category\find id
  return not_found! unless c
  errs = validate.validate @params, {
    {"name", exists: true, min_length: 1, max_length: 100}
  }
  return status: 422, json: {errors: errs} if errs
  c\update name: @params.name
  json: cat_json c

app\delete "/api/categories/:id", =>
  id = tonumber @params.id
  c = id and Category\find id
  return not_found! unless c
  c\delete!
  status: 204, layout: false

check_product = (p, full) ->
  errs = {}
  if full or p.name != nil
    if type(p.name) != "string" or #p.name == 0 or #p.name > 200
      errs[#errs + 1] = "name is required (1..200 chars)"
  if full or p.price != nil
    n = tonumber p.price
    if not n or n < 0
      errs[#errs + 1] = "price must be a non-negative number"
    else
      p.price = n
  if p.category_id != nil and p.category_id != ""
    cid = tonumber p.category_id
    if not cid or not Category\find cid
      errs[#errs + 1] = "category_id does not reference an existing category"
    else
      p.category_id = cid
  else
    p.category_id = nil
  return errs if #errs > 0

app\get "/api/products", =>
  cid = tonumber @params.category_id
  rows = if cid
    Product\select "where category_id = ? order by id", cid
  else
    Product\select "order by id"
  json: jsonify rows, prod_json

app\post "/api/products", json_params =>
  errs = check_product @params, true
  return status: 422, json: {errors: errs} if errs
  p = Product\create {
    name: @params.name
    price: @params.price
    category_id: @params.category_id
  }
  status: 201, json: prod_json p

app\get "/api/products/:id", =>
  id = tonumber @params.id
  p = id and Product\find id
  return not_found! unless p
  json: prod_json p

app\put "/api/products/:id", json_params =>
  id = tonumber @params.id
  p = id and Product\find id
  return not_found! unless p
  errs = check_product @params, false
  return status: 422, json: {errors: errs} if errs
  patch = {}
  patch.name = @params.name if @params.name != nil
  patch.price = @params.price if @params.price != nil
  patch.category_id = @params.category_id if @params.category_id != nil
  p\update patch if next patch
  json: prod_json p

app\delete "/api/products/:id", =>
  id = tonumber @params.id
  p = id and Product\find id
  return not_found! unless p
  p\delete!
  status: 204, layout: false

app.default_route = => not_found!

app.handle_error = (err, trace) =>
  ngx.log ngx.ERR, tostring(err), "\n", tostring(trace)
  status: 500, json: {error: "internal server error"}

app
