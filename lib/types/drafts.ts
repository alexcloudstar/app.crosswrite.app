export type Draft = {
  id: string;
  userId?: string;
  title: string;
  content: string;
  contentPreview?: string;
  status: 'draft' | 'published';
  platforms: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
};

export type DraftListItem = {
  id: string;
  title: string;
  contentPreview?: string;
  status: string;
  platforms: string[];
  updatedAt: Date;
  publishedAt?: Date;
};

export type CreateDraftRequest = {
  title: string;
  content: string;
  contentPreview?: string;
  thumbnailUrl?: string;
  tags?: string[];
};

export type UpdateDraftRequest = {
  title?: string;
  content?: string;
  contentPreview?: string;
  status?: string;
  platforms?: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
};

export type DraftsResponse = {
  drafts: Draft[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
