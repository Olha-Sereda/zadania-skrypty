local cjson = require "cjson"
local shm = ngx.shared.shop_state

local KEY_CATEGORIES = "categories"
local KEY_PRODUCTS   = "products"
local KEY_NEXT_CAT   = "next_category_id"
local KEY_NEXT_PROD  = "next_product_id"

local M = {}

local function read(key)
  local raw = shm:get(key)
  if not raw then return {} end
  local ok, t = pcall(cjson.decode, raw)
  if ok and type(t) == "table" then return t end
  return {}
end

local function write(key, list)
  shm:set(key, cjson.encode(list))
end

local function asArray(t)
  return setmetatable(t, cjson.empty_array_mt)
end

function M.list_categories()
  return asArray(read(KEY_CATEGORIES))
end

function M.get_category(id)
  for _, c in ipairs(read(KEY_CATEGORIES)) do
    if c.id == id then return c end
  end
end

function M.create_category(payload)
  local list = read(KEY_CATEGORIES)
  local item = { id = shm:incr(KEY_NEXT_CAT, 1, 0), name = payload.name }
  table.insert(list, item)
  write(KEY_CATEGORIES, list)
  return item
end

function M.update_category(id, payload)
  local list = read(KEY_CATEGORIES)
  for _, c in ipairs(list) do
    if c.id == id then
      if payload.name then c.name = payload.name end
      write(KEY_CATEGORIES, list)
      return c
    end
  end
end

function M.delete_category(id)
  local list = read(KEY_CATEGORIES)
  for i, c in ipairs(list) do
    if c.id == id then
      table.remove(list, i)
      write(KEY_CATEGORIES, list)
      local prods = read(KEY_PRODUCTS)
      local touched = false
      for _, p in ipairs(prods) do
        if p.category_id == id then
          p.category_id = nil
          touched = true
        end
      end
      if touched then write(KEY_PRODUCTS, prods) end
      return true
    end
  end
  return false
end

function M.list_products(category_id)
  local out = {}
  for _, p in ipairs(read(KEY_PRODUCTS)) do
    if not category_id or p.category_id == category_id then
      out[#out + 1] = p
    end
  end
  return asArray(out)
end

function M.get_product(id)
  for _, p in ipairs(read(KEY_PRODUCTS)) do
    if p.id == id then return p end
  end
end

function M.create_product(payload)
  local list = read(KEY_PRODUCTS)
  local item = {
    id = shm:incr(KEY_NEXT_PROD, 1, 0),
    name = payload.name,
    price = payload.price,
    category_id = payload.category_id,
  }
  list[#list + 1] = item
  write(KEY_PRODUCTS, list)
  return item
end

function M.update_product(id, payload)
  local list = read(KEY_PRODUCTS)
  for _, p in ipairs(list) do
    if p.id == id then
      if payload.name ~= nil then p.name = payload.name end
      if payload.price ~= nil then p.price = payload.price end
      if payload.category_id ~= nil then p.category_id = payload.category_id end
      write(KEY_PRODUCTS, list)
      return p
    end
  end
end

function M.delete_product(id)
  local list = read(KEY_PRODUCTS)
  for i, p in ipairs(list) do
    if p.id == id then
      table.remove(list, i)
      write(KEY_PRODUCTS, list)
      return true
    end
  end
  return false
end

function M.reset()
  shm:flush_all()
  shm:flush_expired()
end

return M
