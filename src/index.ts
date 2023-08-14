import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import express from "express";

import { newRepositoryContent } from "./repositories/content";
import { newRepositoryUser } from "./repositories/user";

import { newHandlerContent } from "./handlers/content";
import { newHandlerUser } from "./handlers/user";
import { newRepositoryBlacklist } from "./repositories/blacklist";
import { HandlerMiddleware } from "./auth/jwt";

async function main() {
  const db = new PrismaClient();
  const redis = createClient();

  try {
    redis.connect();
    db.$connect();
  } catch (err) {
    console.error(err);
    return;
  }

  const repo = newRepositoryUser(db);
  const repoBlacklist = newRepositoryBlacklist(redis);
  const handlerUser = newHandlerUser(repo, repoBlacklist);
  const repoContent = newRepositoryContent(db);
  const handlerContent = newHandlerContent(repoContent);

  const handlerMiddleware = new HandlerMiddleware(repoBlacklist);

  const port = process.env.PORT || 8000;
  const server = express();
  const userRouter = express.Router();
  const contentRouter = express.Router();

  server.use(express.json());
  server.use("/user", userRouter);
  server.use("/content", contentRouter);

  contentRouter.use(handlerMiddleware.jwtMiddleware.bind(handlerMiddleware));

  //Check server status
  server.get("/", (_, res) => {
    return res.status(200).json({ status: "ok" }).end();
  });

  //User API
  userRouter.post("/register", handlerUser.register.bind(handlerUser));
  userRouter.post("/login", handlerUser.login.bind(handlerUser));
  userRouter.get(
    "/logout",
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerUser.logout.bind(handlerUser)
  );

  //Content API
  contentRouter.post("/", handlerContent.createContent.bind(handlerContent));
  contentRouter.get("/:id", handlerContent.getContent.bind(handlerContent));
  contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
  contentRouter.delete(
    "/:id",
    handlerContent.deleteContent.bind(handlerContent)
  );
  contentRouter.patch(
    "/:id",
    handlerContent.updateUserContent.bind(handlerContent)
  );

  server.listen(port, () => console.log(`server is listening on ${port}`));
}

main();
