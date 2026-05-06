import type {
  Incident,
  Category,
  Neighborhood,
  User,
  Media,
  StatusHistory,
  JournalisticContent,
  AdminContact,
  Comment,
} from "@/generated/prisma";

export type IncidentWithRelations = Incident & {
  category: Category;
  neighborhood: Neighborhood;
  author: Pick<User, "id" | "name" | "image">;
  media: Media[];
  statusHistory: (StatusHistory & {
    author: Pick<User, "id" | "name">;
  })[];
  journalisticContent: JournalisticContent[];
  adminContacts: AdminContact[];
  _count: {
    comments: number;
    votes: number;
    follows: number;
  };
};

export type IncidentListItem = Incident & {
  category: Category;
  neighborhood: Neighborhood;
  author: Pick<User, "id" | "name" | "image">;
  media: Pick<Media, "id" | "url" | "thumbnailUrl">[];
};

export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "name" | "image">;
};
