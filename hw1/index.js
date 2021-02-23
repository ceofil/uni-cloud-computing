var http = require("http");
var https = require("https");
const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

logs = [];

async function log(s) {
  logs.push(s);
}

async function handle_generate_exam(req, res) {
  var t0 = new Date().getTime();
  https
    .get("https://opentdb.com/api.php?amount=2&type=boolean", (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        // console.log(JSON.parse(data));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
        var t1 = new Date().getTime();
        log({
          request: {
            method: req.method,
            url: req.url,
          },
          response: data,
          latency: t1 - t0,
        });
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

async function handle_train_student(req, res) {
  var t0 = new Date().getTime();
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
        var t1 = new Date().getTime();
        log({
          request: {
            method: req.method,
            url: req.url,
          },
          response: data,
          latency: t1 - t0,
        });
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

async function handle_submit_results(req, res) {
  var t0 = new Date().getTime();
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    results = {};
    score = 0;
    data = JSON.parse(data);

    for (var q_index in data.results) {
      q = data.results[q_index];
      results[q_index] = {
        Question: q.question,
        CorrectAnswer: q.correct_answer,
        YourAnswer: data.forced_answer == "yes" ? "True" : "False",
      };
      if (results[q_index].CorrectAnswer == results[q_index].YourAnswer) {
        score++;
      }
    }
    passed = score > data.results.length / 2;

    fetch("https://api.jsonbin.io/b", {
      method: "POST",
      body: JSON.stringify({
        Passed: passed,
        Score: score,
        Answers: results,
      }),
      headers: {
        "Content-Type": "application/json",
        "secret-key": process.env.x_master_key,
        private: "false",
      },
    })
      .then((resp) => resp.json())
      .then((text) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(text));
        res.end();

        var t1 = new Date().getTime();
        log({
          request: {
            method: req.method,
            url: req.url,
          },
          response: text,
          latency: t1 - t0,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

function serve_html(req, res) {
  var t0 = new Date().getTime();
  res.writeHead(200, { "content-type": "text/html" });
  fs.createReadStream("index.html").pipe(res);

  var t1 = new Date().getTime();
  log({
    request: {
      method: req.method,
      url: req.url,
    },
    response: "index.html",
    latency: t1 - t0,
  });
}

function serve_logs(req, res) {
  var t0 = new Date().getTime();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(JSON.stringify(logs));
  res.end();

  var t1 = new Date().getTime();
  log({
    request: {
      method: req.method,
      url: req.url,
    },
    response: JSON.stringify(logs),
    latency: t1 - t0,
  });
}

function serve_metrics(req, res) {
  var t0 = new Date().getTime();
  res.writeHead(200, { "Content-Type": "application/json" });
  request_count = {
    GET: {
      "/home": 0,
      "/api/generate_exam": 0,
      "/api/train_student": 0,
      "/api/logs": 0,
      "/api/metrics": 0,
    },
    POST: {
      "/api/submit_results": 0,
    },
    BAD_REQUESTS: 0,
  };
  total_latency_time = 0;
  total_logs = logs.length;
  for (var lg of logs) {
    if (
      lg.request.method in request_count &&
      lg.request.url in request_count[lg.request.method]
    ) {
      request_count[lg.request.method][lg.request.url]++;
    } else {
      request_count.BAD_REQUESTS++;
    }
    total_latency_time += lg.latency;
  }
  metrics = {
    count: request_count,
    average_latency: total_latency_time / total_logs,
    logs: logs,
  };

  res.write(JSON.stringify(metrics));
  res.end();

  var t1 = new Date().getTime();
  log({
    request: {
      method: req.method,
      url: req.url,
    },
    response: {
      count: request_count,
      average_latency: total_latency_time / total_logs,
      logs: JSON.stringify(logs),
    },
    latency: t1 - t0,
  });
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
  {
    url: "/api/logs",
    method: "GET",
    handler: serve_logs,
  },
  {
    url: "/api/metrics",
    method: "GET",
    handler: serve_metrics,
  },
];

var server = http.createServer(async function (req, res) {
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
