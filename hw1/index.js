var http = require("http");
var https = require("https");
const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

async function handle_generate_exam(req, res) {
  https
    .get("https://opentdb.com/api.php?amount=5&type=boolean", (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        // console.log(JSON.parse(data));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

async function handle_train_student(req, res) {
  https
    .get("https://yesno.wtf/api", (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        // console.log(JSON.parse(data));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

async function handle_submit_results(req, res) {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    console.log(data);
    fetch("https://api.jsonbin.io/b", {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json",
        "secret-key": process.env.x_master_key,
        private: "false",
      },
    })
      .then((resp) => resp.json())
      .then((text) => {
        console.log("fasdfa", text);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(text));
        res.end();
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

function serve_html(req, res) {
  res.writeHead(200, { "content-type": "text/html" });
  fs.createReadStream("index.html").pipe(res);
}

let routes = [
  {
    url: "/api/generate_exam",
    method: "GET",
    handler: handle_generate_exam,
  },
  {
    url: "/api/train_student",
    method: "GET",
    handler: handle_train_student,
  },
  {
    url: "/api/submit_results",
    method: "POST",
    handler: handle_submit_results,
  },
  {
    url: "/home",
    method: "GET",
    handler: serve_html,
  },
];

var server = http.createServer(async function (req, res) {
  console.log(req.method, req.url);

  var found = false;
  for (var route of routes) {
    if (route.url === req.url && route.method === req.method) {
      route.handler(req, res);
      found = true;
      break;
    }
  }

  if (found == false) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ message: "Invalid url/method" }));
    res.end();
  }
});

var port = 5000;
server.listen(port);

console.log(`Node.js web server at http://localhost:${port}/ is running...`);
