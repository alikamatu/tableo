export interface NormalizedError {
  message: string;
  code?: string;
  fields?: Record<string, string>;
  statusCode?: number;
  error?: string;
  rawError?: string;
  rawStack?: string;
}

const statusMessages: Record<number, string> = {
  401: 'Incorrect email or password.',
  403: "You don't have permission to perform this action.",
  404: 'The requested information could not be found.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  503: 'Service is temporarily unavailable. Please try again later.',
};

export function normalizeError(error: unknown): NormalizedError {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    const response = err.response;
    const statusCode = response?.status || err.statusCode;
    const data = response?.data;

    // 1. Try to get message from backend response
    let message = data?.message || data?.error || err.message;

    // 2. If it's a generic message like "Unauthorized" or generic axios error, use our map
    const isGeneric =
      !message ||
      message === 'Unauthorized' ||
      message === 'Forbidden' ||
      message.includes('status code');

    if (isGeneric && statusCode && statusMessages[statusCode]) {
      message = statusMessages[statusCode];
    }

    // 3. Handle network errors
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      message = 'Unable to connect. Please check your internet connection.';
    }

    // Ensure message is a string (NestJS sometimes returns arrays for validation errors)
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    return {
      message: message || 'An unknown error occurred',
      code: data?.code || err.code,
      fields: data?.fields,
      statusCode,
      error: data?.error || err.error,
      rawError: data?.rawError,
      rawStack: data?.rawStack,
    };
  }

  return { message: String(error ?? 'An unknown error occurred') };
}
