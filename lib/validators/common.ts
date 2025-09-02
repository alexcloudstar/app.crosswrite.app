import { z } from 'zod';

export const UUID = z.string().uuid('Invalid UUID format');
export const ISODate = z.string().datetime('Invalid ISO date format');
export const PositiveInt = z
  .number()
  .int()
  .positive('Must be a positive integer');
export const StringMax = (max: number) =>
  z.string().max(max, `Maximum ${max} characters allowed`);

export function sanitizeContent(content: string): string {
  return content
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '');
}

export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .substring(0, 200);
}

export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag =>
      tag
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
    )
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .slice(0, 10);
}

export const validatePayloadSize = (
  input: unknown,
  maxSize: number = 10000
): boolean => {
  const inputStr = JSON.stringify(input);
  return inputStr.length <= maxSize;
};

export const validationErrors = {
  required: 'This field is required',
  invalidFormat: 'Invalid format',
  tooLong: 'Content is too long',
  tooShort: 'Content is too short',
  invalidValue: 'Invalid value provided',
} as const;
