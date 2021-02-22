const fetch = require("node-fetch");
require("dotenv").config();
var text = "aaaaaaaaaaa";

data = {
  hello: "world",
};

fetch("https://api.jsonbin.io/b", {
  method: "POST",
  body: JSON.stringify(data),
  headers: {
    "Content-Type": "application/json",
    "secret-key": process.env.x_master_key,
    private: "false",
  },
})
  .then((res) => res.json())
  .then((text) => console.log(text));
