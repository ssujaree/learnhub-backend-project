import { PrismaClient } from "@prisma/client";
import { ICreateContent, IContent } from "../entities";

export interface IRepositoryContent {
  createContent(arg: ICreateContent): Promise<IContent>;
  getContents(): Promise<IContent[]>;
  getContentById(id: number): Promise<IContent | null>;
  deleteUserContentById(id: number): Promise<ICreateContent>;
  updateUserContent(arg: {
    id: number;
    posterId: string;
    rating: number;
    comment: string;
  }): Promise<IContent>;
}

export function newRepositoryContent(db: PrismaClient): IRepositoryContent {
  return new RepositoryContent(db);
}

const includePostedBy = {
  postedBy: {
    select: {
      id: true,
      username: true,
      name: true,
      registeredAt: true,
    },
  },
};

class RepositoryContent implements IRepositoryContent {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async createContent(arg: ICreateContent): Promise<IContent> {
    return await this.db.content.create({
      include: includePostedBy,
      data: {
        ...arg,
        posterId: undefined,
        postedBy: {
          connect: {
            id: arg.posterId,
          },
        },
      },
    });
  }

  async getContents(): Promise<IContent[]> {
    return await this.db.content
      .findMany({
        include: {
          postedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              registeredAt: true,
            },
          },
        },
      })
      .then((contents) => {
        if (!contents) {
          return Promise.resolve([]);
        }

        return Promise.resolve(contents);
      })
      .catch((err) => Promise.reject(`failed to get contents : ${err}`));
  }

  async getContentById(id: number): Promise<IContent | null> {
    return await this.db.content.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            registeredAt: true,
          },
        },
      },
    });
  }

  async updateUserContent(arg: {
    id: number;
    posterId: string;
    rating: number;
    comment: string;
  }): Promise<IContent> {
    const target = await this.db.content.findUnique({
      include: includePostedBy,
      where: { id: arg.id },
    });

    if (!target) {
      return Promise.reject(`no such content ${arg.id}`);
    }

    if (target.postedBy.id !== arg.posterId) {
      return Promise.reject(`invalid owner ${arg.id}`);
    }

    return await this.db.content.update({
      include: includePostedBy,
      where: {
        id: arg.id,
      },
      data: {
        rating: arg.rating,
        comment: arg.comment,
      },
    });
  }

  async deleteUserContentById(id: number): Promise<ICreateContent> {
    const content = await this.db.content.findFirst({
      where: { id },
    });

    if (!content) {
      return Promise.reject(`no such todo : ${id}`);
    }

    return await this.db.content.delete({ where: { id } });
  }
}
