local lapis = require "lapis"
local app_helpers = require "lapis.application"
local json_params = app_helpers.json_params
local validate = require "lapis.validate"
local store = require "store"

local app = lapis.Application()

local function not_found()
  return { status = 404, json = { error = "not found" } }
end

app:get("/", function()
  return { json = {
    service = "lapis-shop",
    stage = "3.0",
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
  return { json = store.list_categories() }
end)

app:post("/api/categories", json_params(function(self)
  local errs = validate.validate(self.params, {
    { "name", exists = true, min_length = 1, max_length = 100 },
  })
  if errs then return { status = 422, json = { errors = errs } } end
  return { status = 201, json = store.create_category({ name = self.params.name }) }
end))

app:get("/api/categories/:id", function(self)
  local id = tonumber(self.params.id)
  local c = id and store.get_category(id)
  if not c then return not_found() end
  return { json = c }
end)

app:put("/api/categories/:id", json_params(function(self)
  local id = tonumber(self.params.id)
  if not id or not store.get_category(id) then return not_found() end
  local errs = validate.validate(self.params, {
    { "name", exists = true, min_length = 1, max_length = 100 },
  })
  if errs then return { status = 422, json = { errors = errs } } end
  return { json = store.update_category(id, { name = self.params.name }) }
end))

app:delete("/api/categories/:id", function(self)
  local id = tonumber(self.params.id)
  if not id or not store.delete_category(id) then return not_found() end
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
    if not cid or not store.get_category(cid) then
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
  return { json = store.list_products(cid) }
end)

app:post("/api/products", json_params(function(self)
  local errs = check_product(self.params, true)
  if errs then return { status = 422, json = { errors = errs } } end
  return { status = 201, json = store.create_product(self.params) }
end))

app:get("/api/products/:id", function(self)
  local id = tonumber(self.params.id)
  local p = id and store.get_product(id)
  if not p then return not_found() end
  return { json = p }
end)

app:put("/api/products/:id", json_params(function(self)
  local id = tonumber(self.params.id)
  if not id or not store.get_product(id) then return not_found() end
  local errs = check_product(self.params, false)
  if errs then return { status = 422, json = { errors = errs } } end
  return { json = store.update_product(id, self.params) }
end))

app:delete("/api/products/:id", function(self)
  local id = tonumber(self.params.id)
  if not id or not store.delete_product(id) then return not_found() end
  return { status = 204, layout = false }
end)

app.default_route = function() return not_found() end

app.handle_error = function(_, err, trace)
  ngx.log(ngx.ERR, tostring(err), "\n", tostring(trace))
  return { status = 500, json = { error = "internal server error" } }
end

return app
