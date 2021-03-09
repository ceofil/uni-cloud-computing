import { IncomingMessage, ServerResponse, createServer } from "http";
import { Connection } from "typeorm";
import { User, Message } from "./entity";

type Route = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  urlRegex: RegExp | string;
  handler: (
    request: IncomingMessage,
    response: ServerResponse,
    conn: Connection
  ) => void;
};

function build_url_regex(url_template: string): RegExp {
  if (url_template.endsWith("/")) {
    url_template += "?";
  } else {
    url_template += "/?";
  }
  url_template = url_template.split("/:id").join("/(\\d+)");
  return new RegExp(`^${url_template}$`);
}

let routes: Route[] = [];

routes.push({
  method: "GET",
  urlRegex: build_url_regex("/users"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    res.setHeader("Content-Type", "application/json");
    const users = await conn.getRepository(User).find();
    res.write(JSON.stringify(users));
    res.statusCode = 200;
    res.end();
  },
});

routes.push({
  method: "GET",
  urlRegex: build_url_regex("/users/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    const id = req.url.split("/")[2];
    res.setHeader("Content-Type", "application/json");
    try {
      const user = await conn.getRepository(User).findOneOrFail(id);
      res.write(JSON.stringify(user));
      res.statusCode = 200;
      res.end();
    } catch {
      res.statusCode = 404;
      res.end("User not found");
    }
  },
});

routes.push({
  method: "GET",
  urlRegex: build_url_regex("/users/:id/messages"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    const id = req.url.split("/")[2];
    res.setHeader("Content-Type", "application/json");
    try {
      const user = await conn.getRepository(User).findOneOrFail(id);
      const messages = await conn.getRepository(Message).find({ user: user });
      res.write(JSON.stringify(messages));
      res.statusCode = 200;
      res.end();
    } catch {
      res.statusCode = 404;
      res.end("User not found");
    }
  },
});

routes.push({
  method: "GET",
  urlRegex: build_url_regex("/users/:id/messages/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    const userId = req.url.split("/")[2];
    const msgId = req.url.split("/")[4];
    res.setHeader("Content-Type", "application/json");
    try {
      const user = await conn.getRepository(User).findOneOrFail(userId);
      const messages = await conn
        .getRepository(Message)
        .find({ user: user, id: Number(msgId) });
      console.log(messages);
      if (messages.length > 0) {
        res.write(JSON.stringify(messages));
        res.statusCode = 200;
        res.end();
      } else {
        res.statusCode = 404;
        res.end("Message not found");
      }
    } catch {
      res.statusCode = 404;
      res.end("User not found");
    }
  },
});

routes.push({
  method: "POST",
  urlRegex: build_url_regex("/users"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      let body = JSON.parse(data);
      let user = new User(body.name);
      res.setHeader("Content-Type", "application/json");
      user = await conn.getRepository(User).save(user);
      res.setHeader("Location", `/users/${user.id}`);
      res.write(JSON.stringify({ id: user.id }));
      res.statusCode = 200;
      res.end();
    });
  },
});

routes.push({
  method: "POST",
  urlRegex: build_url_regex("/users/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    let id = req.url.split("/")[2];
    res.setHeader("Content-Type", "application/json");
    try {
      const _ = await conn.getRepository(User).findOneOrFail(id);
      res.statusCode = 409; //resource already exists
    } catch {
      res.statusCode = 404;
    }
    res.end();
  },
});

routes.push({
  method: "POST",
  urlRegex: build_url_regex("/users/:id/messages"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    let id = req.url.split("/")[2];
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      let body = JSON.parse(data);
      try {
        const user = await conn.getRepository(User).findOneOrFail(id);
        let message = new Message(body.text, user);
        res.setHeader("Content-Type", "application/json");

        message = await conn.getRepository(Message).save(message);
        res.setHeader("Location", `/users/${id}/messages${message.id}`);
        res.write(JSON.stringify({ id: message.id }));
        res.statusCode = 200;
      } catch {
        res.write(JSON.stringify({ error: "user not found" }));
        res.statusCode = 404;
      }
      res.end();
    });
  },
});

routes.push({
  method: "POST",
  urlRegex: build_url_regex("/users/:id/messages/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    let id = req.url.split("/")[2];
    let msgId = req.url.split("/")[4];
    res.setHeader("Content-Type", "application/json");
    try {
      const user = await conn.getRepository(User).findOneOrFail(id);
      const _ = await conn.getRepository(Message).findOneOrFail(msgId);
      res.statusCode = 409;
    } catch {
      res.statusCode = 404;
    }
    res.end();
  },
});

routes.push({
  method: "PUT",
  urlRegex: build_url_regex("/users"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    res.statusCode = 405;
    res.end();
  },
});

routes.push({
  method: "PUT",
  urlRegex: build_url_regex("/users/:id/messages"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    res.statusCode = 405;
    res.end();
  },
});

routes.push({
  method: "PUT",
  urlRegex: build_url_regex("/users/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    let id = req.url.split("/")[2];
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      let body = JSON.parse(data);
      const userRepo = await conn.getRepository(User);
      try {
        const user = await userRepo.findOneOrFail(id);
        user.name = body.name;
        await userRepo.save(user);
        res.write(JSON.stringify(user));
        res.statusCode = 200;
      } catch {
        res.statusCode = 404;
      }
      res.end();
    });
  },
});

routes.push({
  method: "PUT",
  urlRegex: build_url_regex("/users/:id/messages/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    let id = req.url.split("/")[2];
    let msgId = req.url.split("/")[4];
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      let body = JSON.parse(data);
      const userRepo = await conn.getRepository(User);
      const msgRepo = await conn.getRepository(Message);
      try {
        const user = await userRepo.findOneOrFail(id);
        const messages = await msgRepo.find({ user: user, id: Number(msgId) });
        if (messages.length == 0) {
          res.statusCode = 404;
        } else {
          const message = messages[0];
          message.text = body.text;
          message.edited = true;
          await msgRepo.save(message);
          res.write(JSON.stringify(message));
          res.statusCode = 200;
        }
      } catch {
        res.statusCode = 404;
      }
      res.end();
    });
  },
});

routes.push({
  method: "DELETE",
  urlRegex: build_url_regex("/users/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    const id = req.url.split("/")[2];
    res.setHeader("Content-Type", "application/json");
    try {
      const userRepo = await conn.getRepository(User);
      const user = await userRepo.findOneOrFail(id);
      userRepo.remove(user);
      res.statusCode = 204;
      res.end();
    } catch {
      res.statusCode = 404;
      res.end("User not found");
    }
  },
});

routes.push({
  method: "DELETE",
  urlRegex: build_url_regex("/users/:id/messages/:id"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    const id = req.url.split("/")[2];
    const msgId = req.url.split("/")[4];
    res.setHeader("Content-Type", "application/json");
    const userRepo = await conn.getRepository(User);
    const msgRepo = await conn.getRepository(Message);
    try {
      const user = await userRepo.findOneOrFail(id);
      const messages = await msgRepo.find({ user: user, id: Number(msgId) });
      if (messages.length == 0) {
        res.statusCode = 404;
      } else {
        const message = messages[0];
        msgRepo.remove(message);
        res.statusCode = 204;
      }
    } catch {
      res.statusCode = 404;
    }
    res.end();
  },
});

routes.push({
  method: "DELETE",
  urlRegex: build_url_regex("/users"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    res.statusCode = 405;
    res.end();
  },
});

routes.push({
  method: "DELETE",
  urlRegex: build_url_regex("/users/:id/messages"),
  handler: async function (
    req: IncomingMessage,
    res: ServerResponse,
    conn: Connection
  ) {
    res.statusCode = 405;
    res.end();
  },
});

function bad_url_handler(req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 404;
  res.end(`url not found (${req.url})`);
}

export function get_server(conn: Connection) {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url !== "/favicon.ico") {
      console.log(req.method, req.url);
    }

    let route = routes.find(
      (r) => req.method == r.method && req.url!.match(r.urlRegex) !== null
    );

    if (route) {
      route.handler(req, res, conn);
    } else {
      bad_url_handler(req, res);
    }
  });
}

/*
/users/, 
/users/:id, 
/users/:id/messages, 
/users/:id/messages/:id
*/
