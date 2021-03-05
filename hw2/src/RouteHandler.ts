import { createServer, IncomingMessage, ServerResponse } from "http";
import { url } from "inspector";

type Route = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  urlRegex: RegExp | string;
  handler: (request: IncomingMessage, response: ServerResponse) => void;
};

function build_url_regex(url_template: string): RegExp {
  if (url_template.endsWith("/")) {
    url_template += "?";
  } else {
    url_template += "/?";
  }
  return new RegExp(`^${url_template.replace("/:id", "/\\d+")}$`);
}

let routes: Route[] = [];
routes.push({
  method: "GET",
  urlRegex: build_url_regex("/collection"),
  handler: (req: IncomingMessage, res: ServerResponse) => {
    res.end("collection URL: " + req.url);
  },
});

routes.push({
  method: "GET",
  urlRegex: build_url_regex("/collection/:id"),
  handler: (req: IncomingMessage, res: ServerResponse) => {
    res.end("collection id URL: " + req.url);
  },
});

function bad_url_handler(req: IncomingMessage, res: ServerResponse) {
  res.end("bad URL: " + req.url);
}

export function request_handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url !== "/favicon.ico") {
    console.log(req.method, req.url);
  }

  let route = routes.find(
    (r) => req.method == r.method && req.url.match(r.urlRegex) !== null
  );

  if (route) {
    route.handler(req, res);
  } else {
    bad_url_handler(req, res);
  }
}
