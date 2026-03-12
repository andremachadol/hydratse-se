import type { UserNotice } from '../types';

export const collapseNotices = (notices: UserNotice[]): UserNotice | null => {
  const [firstNotice, ...remainingNotices] = notices;
  if (!firstNotice) {
    return null;
  }

  return {
    title: firstNotice.title,
    message: [
      firstNotice.message,
      ...remainingNotices.map((notice) => `${notice.title}\n${notice.message}`),
    ].join('\n\n'),
  };
};

export const mergeErrorMessageWithNotices = (
  errorMessage: string | undefined,
  notices: UserNotice[],
): string => {
  const collapsedNotices = collapseNotices(notices);
  if (!collapsedNotices) {
    return errorMessage ?? '';
  }

  if (!errorMessage) {
    return `${collapsedNotices.title}\n${collapsedNotices.message}`;
  }

  return `${errorMessage}\n\n${collapsedNotices.title}\n${collapsedNotices.message}`;
};
