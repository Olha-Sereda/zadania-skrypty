local lapis = require "lapis"
local app_helpers = require "lapis.application"
local json_params = app_helpers.json_params
local validate = require "lapis.validate"
local cjson = require "cjson"
local Category = require "models.Category"
local Product = require "models.Product"

local app = lapis.Application()

local function not_found()
  return { status = 404, json = { error = "not found" } }
end

local function cat_json(c)
  return { id = c.id, name = c.name }
end

local function prod_json(p)
  return {
    id = p.id,
    name = p.name,
    price = tonumber(p.price),
    category_id = p.category_id,
  }
end

local function jsonify(list, fn)
  local out = setmetatable({}, cjson.empty_array_mt)
  for i, item in ipairs(list) do out[i] = fn(item) end
  return out
end

app:get("/", function()
  return { json = {
    service = "lapis-shop",
    stage = "3.5",
    endpoints = {
      "GET    /api/categories",
      "POST   /api/categories",
      "GET    /api/categories/:id",
      "PUT    /api/categories/:id",
      "DELETE /api/categories/:id",
      "GET    /api/products",
      "POST   /api/products",
      "GET    /api/products/:id",
      "PUT    /api/products/:id",
      "DELETE /api/products/:id",
    },
  }}
end)

app:get("/api/categories", function()
  return { json = jsonify(Category:select("order by id"), cat_json) }
end)

app:post("/api/categories", json_params(function(self)
  local errs = validate.validate(self.params, {
    { "name", exists = true, min_length = 1, max_length = 100 },
  })
  if errs then return { status = 422, json = { errors = errs } } end
  local c = Category:create({ name = self.params.name })
  return { status = 201, json = cat_json(c) }
end))

app:get("/api/categories/:id", function(self)
  local id = tonumber(self.params.id)
  local c = id and Category:find(id)
  if not c then return not_found() end
  return { json = cat_json(c) }
end)

app:put("/api/categories/:id", json_params(function(self)
  local id = tonumber(self.params.id)
  local c = id and Category:find(id)
  if not c then return not_found() end
  local errs = validate.validate(self.params, {
    { "name", exists = true, min_length = 1, max_length = 100 },
  })
  if errs then return { status = 422, json = { errors = errs } } end
  c:update({ name = self.params.name })
  return { json = cat_json(c) }
end))

app:delete("/api/categories/:id", function(self)
  local id = tonumber(self.params.id)
  local c = id and Category:find(id)
  if not c then return not_found() end
  c:delete()
  return { status = 204, layout = false }
end)

local function check_product(p, full)
  local errs = {}
  if full or p.name ~= nil then
    if type(p.name) ~= "string" or #p.name == 0 or #p.name > 200 then
      errs[#errs+1] = "name is required (1..200 chars)"
    end
  end
  if full or p.price ~= nil then
    local n = tonumber(p.price)
    if not n or n < 0 then
      errs[#errs+1] = "price must be a non-negative number"
    else
      p.price = n
    end
  end
  if p.category_id ~= nil and p.category_id ~= "" then
    local cid = tonumber(p.category_id)
    if not cid or not Category:find(cid) then
      errs[#errs+1] = "category_id does not reference an existing category"
    else
      p.category_id = cid
    end
  else
    p.category_id = nil
  end
  if #errs > 0 then return errs end
end

app:get("/api/products", function(self)
  local cid = tonumber(self.params.category_id)
  local rows
  if cid then
    rows = Product:select("where category_id = ? order by id", cid)
  else
    rows = Product:select("order by id")
  end
  return { json = jsonify(rows, prod_json) }
end)

app:post("/api/products", json_params(function(self)
  local errs = check_product(self.params, true)
  if errs then return { status = 422, json = { errors = errs } } end
  local p = Product:create({
    name = self.params.name,
    price = self.params.price,
    category_id = self.params.category_id,
  })
  return { status = 201, json = prod_json(p) }
end))

app:get("/api/products/:id", function(self)
  local id = tonumber(self.params.id)
  local p = id and Product:find(id)
  if not p then return not_found() end
  return { json = prod_json(p) }
end)

app:put("/api/products/:id", json_params(function(self)
  local id = tonumber(self.params.id)
  local p = id and Product:find(id)
  if not p then return not_found() end
  local errs = check_product(self.params, false)
  if errs then return { status = 422, json = { errors = errs } } end
  local patch = {}
  if self.params.name ~= nil then patch.name = self.params.name end
  if self.params.price ~= nil then patch.price = self.params.price end
  if self.params.category_id ~= nil then patch.category_id = self.params.category_id end
  if next(patch) then p:update(patch) end
  return { json = prod_json(p) }
end))

app:delete("/api/products/:id", function(self)
  local id = tonumber(self.params.id)
  local p = id and Product:find(id)
  if not p then return not_found() end
  p:delete()
  return { status = 204, layout = false }
end)

app.default_route = function() return not_found() end

app.handle_error = function(_, err, trace)
  ngx.log(ngx.ERR, tostring(err), "\n", tostring(trace))
  return { status = 500, json = { error = "internal server error" } }
end

return app
