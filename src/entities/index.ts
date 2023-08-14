export interface ICreateUser {
  username: string;
  password: string;
  name: string;
}

export interface IPostedUser {
  id: string;
  username: string;
  name: string;
  registeredAt: Date;
}

export interface IUser {
  id: string;
  username: string;
  password: string;
}

// For writing to DB
export interface ICreateContent {
  videoTitle: string;
  videoUrl: string;
  comment: string;
  rating: number;
  thumbnailUrl: string;
  creatorName: string;
  creatorUrl: string;
  posterId: string;
}

export interface IContent extends ICreateContent {
  id: number;
  postedBy: IPostedUser;
  createdAt: Date;
  updatedAt: Date;
}
