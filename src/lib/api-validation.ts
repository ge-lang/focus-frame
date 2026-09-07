export class InvalidRequestError extends Error {
  constructor(message = 'Invalid request body') {
    super(message);
    this.name = 'InvalidRequestError';
  }
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new InvalidRequestError('Invalid JSON body');
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InvalidRequestError('Request body must be a JSON object');
  }

  return value as Record<string, unknown>;
}

export function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new InvalidRequestError('Invalid date');

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new InvalidRequestError('Invalid date');
  return date;
}

export function parseOptionalString(value: unknown, maxLength: number, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new InvalidRequestError(`Invalid ${field}`);
  }
  return value.trim();
}

export function isAllowedWebUrl(value: string): boolean {
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value);
  const candidate = hasScheme ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function isIntegerBetween(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T);
}

export function normalizeWebUrl(value: string): string {
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  const url = new URL(candidate);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new InvalidRequestError('A valid web URL is required');
  }
  return url.toString();
}
