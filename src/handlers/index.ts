import { JwtAuthRequest } from "../auth/jwt";
import { Request, Response } from "express";

export interface Empty {}

export interface AppRequest<Params, Body> extends Request<Params, any, Body> {}

export type HandlerFunc<Req> = (req: Req, res: Response) => Promise<Response>;

export interface WithMsg {
  videoUrl: string;
  comment: string;
  rating: number;
}

export interface WithId {
  id: string;
}

export interface WithUser {
  username: string;
  password: string;
  name: string;
}

export interface IHandlerContent {
  createContent: HandlerFunc<JwtAuthRequest<Empty, WithMsg>>;
  getContent: HandlerFunc<JwtAuthRequest<WithId, Empty>>;
  deleteContent: HandlerFunc<JwtAuthRequest<WithId, WithMsg>>;
  getContents: HandlerFunc<JwtAuthRequest<WithId, WithMsg>>;
  updateUserContent: HandlerFunc<JwtAuthRequest<WithId, WithMsg>>;
}

export interface IHandlerUser {
  register: HandlerFunc<AppRequest<Empty, WithUser>>;
  login: HandlerFunc<AppRequest<Empty, WithUser>>;
  logout: HandlerFunc<JwtAuthRequest<Empty, Empty>>;
}
