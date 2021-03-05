import "reflect-metadata";
import { createConnection } from "typeorm";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { request_handler } from "./RouteHandler";
const port = 5000;

function onStartCallback(error: Error) {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server listening on http://localhost:${port}/`);
  }
}

function main(): void {
  createConnection()
    .then(async (connection) => {
      const server = createServer(request_handler);
      server.listen(port, onStartCallback);
    })
    .catch((error) => console.log(error));
}

main();
