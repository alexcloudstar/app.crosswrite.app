export type UserSettings = {
  userId: string;
  bio?: string;
  website?: string;
  preferredTone: string;
  defaultTags: string[];
  autoGenerateUrls: boolean;
  includeReadingTime: boolean;
  defaultPublishTime: string;
  autoSchedule: boolean;
  notifications: {
    publishSuccess: boolean;
    publishErrors: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
  };
};

export type User = {
  id: string;
  name?: string;
  email: string;
  image?: string;
};

export type SettingsComponentProps = {
  settings: UserSettings | null;
  onSave: () => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
};

export type ProfileSettingsProps = SettingsComponentProps & {
  user: User | null;
};
