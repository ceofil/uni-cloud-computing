import "reflect-metadata";
import { createConnection } from "typeorm";
import { get_server } from "./RouteHandler";
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
      const server = get_server(connection);
      server.listen(port, onStartCallback);
    })
    .catch((error) => console.log(error));
}

main();
