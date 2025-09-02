export type Draft = {
  id: string;
  userId?: string;
  title: string;
  content: string;
  contentPreview?: string;
  status: 'draft' | 'scheduled' | 'published';
  platforms: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
};

export type DraftListItem = {
  id: string;
  title: string;
  contentPreview?: string;
  status: string;
  platforms: string[];
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
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
  scheduledAt?: Date;
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
