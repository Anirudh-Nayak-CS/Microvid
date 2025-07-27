import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import { connectToDB } from "./db/connection.js";
import { app } from "./app.js";

connectToDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error: ", err);
      throw err;
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch((e) => {
    console.log("MongoDB Connection failed", e);
    throw e;
  });
