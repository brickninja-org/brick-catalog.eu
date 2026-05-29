import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  emitEvent,
  handleAIError,
} from '@/workflows/shared';

const { MockFatalError, MockRetryableError, writerWrite, writerReleaseLock } =
  vi.hoisted(() => {
    class MockFatalError extends Error {
      name = 'FatalError';
    }

    class MockRetryableError extends Error {
      name = 'RetryableError';
      retryAfter?: string;
      constructor(message: string, options?: { retryAfter?: string }) {
        super(message);
        this.retryAfter = options?.retryAfter;
      }
    }

    return {
      MockFatalError,
      MockRetryableError,
      writerWrite: vi.fn().mockResolvedValue(undefined),
      writerReleaseLock: vi.fn(),
    };
  });

vi.mock('workflow', () => ({
  FatalError: MockFatalError,
  RetryableError: MockRetryableError,
  getWritable: vi.fn(() => ({
    getWriter: () => ({
      write: writerWrite,
      releaseLock: writerReleaseLock,
    }),
  })),
}));

describe('emitEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write workflow events with timestamp', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(12345);

    await emitEvent({ type: 'step:start', step: 'doThing' });

    expect(writerWrite).toHaveBeenCalledTimes(1);
    expect(writerWrite).toHaveBeenCalledWith({
      type: 'step:start',
      step: 'doThing',
      timestamp: 12345,
    });
    expect(writerReleaseLock).toHaveBeenCalledTimes(1);

    nowSpy.mockRestore();
  });
});

describe('handleAIError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should rethrow Error instances unchanged', () => {
    const originalError = new Error('Some other error');

    expect(() => handleAIError(originalError)).toThrow(originalError);
  });

  it('should wrap non-Error values', () => {
    expect(() => handleAIError('string error')).toThrow(
      'Unknown workflow error',
    );
  });

  it('should throw RetryableError for 429 errors', () => {
    expect(() => handleAIError(new Error('status 429'))).toThrow(
      MockRetryableError,
    );
  });

  it('should throw FatalError for 401/403 errors', () => {
    expect(() => handleAIError(new Error('status 401'))).toThrow(
      MockFatalError,
    );
    expect(() => handleAIError(new Error('status 403'))).toThrow(
      MockFatalError,
    );
  });
});
