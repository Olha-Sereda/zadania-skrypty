local schema = require "lapis.db.schema"
local types = schema.types

return {
  [1] = function()
    schema.create_table("categories", {
      { "id", types.serial },
      { "name", types.varchar },
      "PRIMARY KEY (id)",
    })
  end,

  [2] = function()
    schema.create_table("products", {
      { "id", types.serial },
      { "name", types.varchar },
      { "price", types.numeric },
      { "category_id", types.foreign_key { null = true } },
      "PRIMARY KEY (id)",
      "FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL",
    })
    schema.create_index("products", "category_id")
  end,
}
