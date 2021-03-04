import "reflect-metadata";
import { createConnection } from "typeorm";
// import { User } from "./entity/User";

createConnection()
  .then(async (connection) => {
    //init repos
    //routing
  })
  .catch((error) => console.log(error));
