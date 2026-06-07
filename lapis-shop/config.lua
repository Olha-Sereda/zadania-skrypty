local config = require "lapis.config"

local function env(name, default)
  local v = os.getenv(name)
  if v == nil or v == "" then return default end
  return v
end

local pg = {
  host = env("POSTGRES_HOST", "127.0.0.1"),
  user = env("POSTGRES_USER", "lapis_shop"),
  password = env("POSTGRES_PASSWORD", "lapis_shop"),
  database = env("POSTGRES_DB", "lapis_shop"),
}

config("development", {
  port = 8080,
  code_cache = "off",
  num_workers = 1,
  postgres = pg,
  measure_performance = false,
  logging = { queries = true, requests = true },
})

config("test", {
  port = 8081,
  code_cache = "off",
  num_workers = 1,
  postgres = {
    host = pg.host,
    user = pg.user,
    password = pg.password,
    database = env("POSTGRES_DB_TEST", "lapis_shop_test"),
  },
})
