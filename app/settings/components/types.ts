export interface UserSettings {
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
}

export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
}

export interface SettingsComponentProps {
  settings: UserSettings | null;
  onSave: () => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

export interface ProfileSettingsProps extends SettingsComponentProps {
  user: User | null;
}
