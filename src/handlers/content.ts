import { IRepositoryContent } from "../repositories/content";
import { Response } from "express";
import { JwtAuthRequest } from "../auth/jwt";
import { Empty, WithId, WithMsg } from ".";
import { IHandlerContent } from ".";
import { getVideoDetails } from "../utils/oembed";

export function newHandlerContent(
  repoContent: IRepositoryContent
): IHandlerContent {
  return new HandlerContent(repoContent);
}

export class HandlerContent implements IHandlerContent {
  private repo: IRepositoryContent;

  constructor(repo: IRepositoryContent) {
    this.repo = repo;
  }

  async createContent(
    req: JwtAuthRequest<Empty, WithMsg>,
    res: Response
  ): Promise<Response> {
    const { videoUrl, comment, rating } = req.body;
    if (!videoUrl || !comment || !rating) {
      return res.status(400).json({ error: "missing msg in json body" }).end();
    }

    const posterId = req.payload.id;
    const details = await getVideoDetails(videoUrl);

    return this.repo
      .createContent({ posterId, comment, rating, ...details })
      .then((content) => res.status(201).json(content).end())
      .catch((err) => {
        console.error(`failed to create content : ${err}`);
        return res
          .status(500)
          .json({ error: `failed to create content` })
          .end();
      });
  }

  async getContent(
    req: JwtAuthRequest<WithId, Empty>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${req.params.id} is not a number` });
    }

    return this.repo
      .getContentById(id)
      .then((content) => {
        if (!content) {
          return res
            .status(404)
            .json({ error: `no such content: ${id}` })
            .end();
        }

        return res.status(200).json(content).end();
      })
      .catch((err) => {
        const errMsg = `failed to get content ${id}: ${err}`;
        console.error(errMsg);
        return res.status(500).json({ error: errMsg });
      });
  }

  async getContents(
    req: JwtAuthRequest<WithId, WithMsg>,
    res: Response
  ): Promise<Response> {
    try {
      const contents = await this.repo.getContents();
      return res.status(200).json(contents).end();
    } catch (err) {
      console.error("failed to get contents", err);
      return res.status(500).json({ error: "failed to get contents" }).end();
    }
  }

  async updateUserContent(
    req: JwtAuthRequest<WithId, WithMsg>,
    res: Response
  ): Promise<Response> {
    if (!req.params.id) {
      return res.status(400).json({ error: `missing id in params` }).end();
    }

    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${req.params.id} is not a number` });
    }

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: "missing msg in json body" }).end();
    }

    return this.repo
      .updateUserContent({ id, posterId: req.payload.id, rating, comment })
      .then((updated) => res.status(201).json(updated).end())
      .catch((err) => {
        const errMsg = `failed to update content ${id}: ${err}`;
        console.error(errMsg);
        return res.status(500).json({ error: errMsg }).end();
      });
  }

  async deleteContent(
    req: JwtAuthRequest<WithId, WithMsg>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: `id ${req.params.id} is not a number` });
    }

    return this.repo
      .deleteUserContentById(id)
      .then((deleted) => res.status(200).json(deleted).end())
      .catch((err) => {
        console.error(`failed to delete content ${id} : ${err}`);
        return res
          .status(500)
          .json({ error: `failed to delete content ${id}` });
      });
  }
}
