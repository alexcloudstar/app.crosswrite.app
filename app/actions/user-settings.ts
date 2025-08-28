'use server';

import { db } from '@/db/client';
import { userSettings, users } from '@/db/schema/auth';
import { requireAuth, successResult, errorResult } from './_utils';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

const updateWritingDefaultsSchema = z.object({
  preferredTone: z.enum(['professional', 'casual', 'friendly', 'academic']),
  defaultTags: z.array(z.string()),
  autoGenerateUrls: z.boolean(),
  includeReadingTime: z.boolean(),
});

const updatePublishingSchema = z.object({
  defaultPublishTime: z.string(),
  autoSchedule: z.boolean(),
});

const updateNotificationsSchema = z.object({
  publishSuccess: z.boolean(),
  publishErrors: z.boolean(),
  dailyDigest: z.boolean(),
  weeklyReport: z.boolean(),
});

export async function getUserSettings() {
  try {
    const session = await requireAuth();

    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.id))
      .limit(1);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (settings.length === 0) {
      const defaultSettings = {
        userId: session.id,
        preferredTone: 'professional',
        defaultTags: [],
        autoGenerateUrls: true,
        includeReadingTime: false,
        defaultPublishTime: '09:00',
        autoSchedule: true,
        notifications: {
          publishSuccess: true,
          publishErrors: true,
          dailyDigest: false,
          weeklyReport: true,
        },
      };

      await db.insert(userSettings).values(defaultSettings);

      return successResult({
        user: user[0] || null,
        settings: defaultSettings,
      });
    }

    return successResult({
      user: user[0] || null,
      settings: settings[0],
    });
  } catch (error) {
    console.error('Failed to get user settings:', error);
    return errorResult('Failed to fetch user settings');
  }
}

export async function updateProfile(
  input: z.infer<typeof updateProfileSchema>
) {
  try {
    const session = await requireAuth();
    const validatedInput = updateProfileSchema.parse(input);

    if (validatedInput.name !== undefined) {
      await db
        .update(users)
        .set({ name: validatedInput.name })
        .where(eq(users.id, session.id));
    }

    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.id))
      .limit(1);

    if (existingSettings.length === 0) {
      await db.insert(userSettings).values({
        userId: session.id,
        bio: validatedInput.bio,
        website: validatedInput.website,
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(userSettings)
        .set({
          bio: validatedInput.bio,
          website: validatedInput.website,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.id));
    }

    // Revalidate the session to reflect changes
    revalidatePath('/', 'layout');

    return successResult('Profile updated successfully');
  } catch (error) {
    console.error('Failed to update profile:', error);
    return errorResult('Failed to update profile');
  }
}

export async function updateWritingDefaults(
  input: z.infer<typeof updateWritingDefaultsSchema>
) {
  try {
    const session = await requireAuth();
    const validatedInput = updateWritingDefaultsSchema.parse(input);

    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.id))
      .limit(1);

    if (existingSettings.length === 0) {
      await db.insert(userSettings).values({
        userId: session.id,
        ...validatedInput,
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(userSettings)
        .set({
          ...validatedInput,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.id));
    }

    return successResult('Writing defaults updated successfully');
  } catch (error) {
    console.error('Failed to update writing defaults:', error);
    return errorResult('Failed to update writing defaults');
  }
}

export async function updatePublishingSettings(
  input: z.infer<typeof updatePublishingSchema>
) {
  try {
    const session = await requireAuth();
    const validatedInput = updatePublishingSchema.parse(input);

    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.id))
      .limit(1);

    if (existingSettings.length === 0) {
      await db.insert(userSettings).values({
        userId: session.id,
        ...validatedInput,
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(userSettings)
        .set({
          ...validatedInput,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.id));
    }

    return successResult('Publishing settings updated successfully');
  } catch (error) {
    console.error('Failed to update publishing settings:', error);
    return errorResult('Failed to update publishing settings');
  }
}

export async function updateNotificationSettings(
  input: z.infer<typeof updateNotificationsSchema>
) {
  try {
    const session = await requireAuth();
    const validatedInput = updateNotificationsSchema.parse(input);

    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.id))
      .limit(1);

    if (existingSettings.length === 0) {
      await db.insert(userSettings).values({
        userId: session.id,
        notifications: validatedInput,
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(userSettings)
        .set({
          notifications: validatedInput,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.id));
    }

    return successResult('Notification settings updated successfully');
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    return errorResult('Failed to update notification settings');
  }
}
