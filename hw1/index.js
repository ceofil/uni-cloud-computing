var http = require("http");
var https = require("https");

function handle_generate_exam(req, res) {
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

function handle_train_student(req, res) {
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

function handle_submit_results(req, res) {
  console.log("results submitted");
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
];

var server = http.createServer(function (req, res) {
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
