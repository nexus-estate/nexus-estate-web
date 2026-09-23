'use client';

import toast from 'react-hot-toast';
import { ApiError } from '@/lib/api/core/error';
import { getApiErrorDisplayMessage } from '@/lib/api/error-message';

type Translate = (key: string) => string;

/**
 * One entry point for user feedback.
 *
 * Every mutation should report its outcome: silent success and silent failure
 * are both bugs in a data-dense product. `apiError` reuses the shared API error
 * mapping (business codes + request id) instead of printing raw messages.
 */
export const notify = {
  success(message: string) {
    return toast.success(message);
  },

  error(message: string) {
    return toast.error(message);
  },

  info(message: string) {
    return toast(message);
  },

  /**
   * Reports a failed operation. `translate` is the `common` namespace so error
   * codes resolve to the same wording everywhere in the product.
   */
  apiError(error: unknown, translate: Translate, fallbackKey?: string) {
    const message =
      error instanceof ApiError
        ? getApiErrorDisplayMessage(error, translate)
        : fallbackKey
          ? translate(fallbackKey)
          : translate('errors.unexpected');
    return toast.error(message);
  },

  /** Keeps a long-running mutation visible while it is in flight. */
  async promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) {
    return toast.promise(promise, messages);
  },
};

export const FEEDBACK = {
  created: 'feedback.created',
  updated: 'feedback.updated',
  deleted: 'feedback.deleted',
  published: 'feedback.published',
  archived: 'feedback.archived',
  approved: 'feedback.approved',
  sent: 'feedback.sent',
  assigned: 'feedback.assigned',
} as const;

export type FeedbackKey = (typeof FEEDBACK)[keyof typeof FEEDBACK];
