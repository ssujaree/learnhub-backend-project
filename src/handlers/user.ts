import { compareHash, hashPassword } from "../auth/bcrypt";
import { IRepositoryUser } from "../repositories/user";
import { Response } from "express";
import { AppRequest, Empty, IHandlerUser, WithUser } from ".";
import { JwtAuthRequest, Payload, newJwt } from "../auth/jwt";
import { IRepositoryBlacklist } from "../repositories/blacklist";

export function newHandlerUser(
  repo: IRepositoryUser,
  repoBlacklist: IRepositoryBlacklist
): IHandlerUser {
  return new HandlerUser(repo, repoBlacklist);
}

class HandlerUser implements IHandlerUser {
  private repo: IRepositoryUser;
  private repoBlacklist: IRepositoryBlacklist;

  constructor(repo: IRepositoryUser, repoBlacklist: IRepositoryBlacklist) {
    this.repo = repo;
    this.repoBlacklist = repoBlacklist;
  }

  async register(
    req: AppRequest<Empty, WithUser>,
    res: Response
  ): Promise<Response> {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
      return res
        .status(400)
        .json({ error: "missing username, name or password" })
        .end();
    }

    return this.repo
      .createUser({ username, password: await hashPassword(password), name })
      .then((user) =>
        res
          .status(201)
          .json({ ...user, password: undefined })
          .end()
      )

      .catch((err) => {
        const errMsg = `failed to create user ${username}`;
        console.error(`${errMsg} : ${err}`);
        return res.status(500).json({ error: errMsg }).end();
      });
  }

  async login(
    req: AppRequest<Empty, WithUser>,
    res: Response
  ): Promise<Response> {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "missing username or password" })
        .end();
    }

    try {
      const user = await this.repo.getUser(username);
      const isMatch = await compareHash(password, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "invalid username or password" })
          .end();
      }
      const payload: Payload = { id: user.id, username: user.username };
      const token = newJwt(payload);

      return res
        .status(200)
        .json({
          status: "logged in",
          id: user.id,
          username,
          token,
        })
        .end();
    } catch (err) {
      console.error(`failed to get user: ${err}`);
      return res.status(500).end();
    }
  }

  async logout(
    req: JwtAuthRequest<Empty, Empty>,
    res: Response
  ): Promise<Response> {
    return await this.repoBlacklist
      .addToBlacklist(req.token)
      .then(() =>
        res.status(200).json({ status: `logged out`, token: req.token }).end()
      )
      .catch((err) => {
        console.error(err);
        return res
          .status(500)
          .json({ error: `could not log out with token ${req.token}` })
          .end();
      });
  }
}
