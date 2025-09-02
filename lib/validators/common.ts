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
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ ]{3,}/g, '  ');
}

export function generateContentPreview(
  content: string,
  maxLength: number = 200
): string {
  // Remove markdown formatting for preview while preserving structure
  const plainText = content
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/\n{2,}/g, ' ') // Replace multiple newlines with space
    .replace(/\n/g, ' ') // Replace single newlines with space
    .trim();

  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + '...'
    : plainText;
}

export function cleanContentForAI(content: string): string {
  // Clean content by removing markdown and special characters for AI processing
  return content
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n{2,}/g, ' ') // Replace multiple newlines with space
    .replace(/\n/g, ' ') // Replace single newlines with space
    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
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
