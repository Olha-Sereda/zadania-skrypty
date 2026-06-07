package = "lapis-shop"
version = "dev-1"

source = {
  url = "."
}

description = {
  summary = "REST API for a small shop, built with Lapis (Lua/MoonScript)."
}

dependencies = {
  "lua >= 5.1",
  "lapis",
  "lapis-console",
}

build = {
  type = "builtin",
  modules = {
    app   = "app.lua",
    store = "store.lua",
  },
}
