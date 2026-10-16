export type FeedbackRating = 'up' | 'down';

export const FEEDBACK_DISCUSSION_URL =
  'https://github.com/predatorray/rendezvous/discussions/new';
export const FEEDBACK_DISCUSSION_CATEGORY = 'general';
export const FEEDBACK_COMMENT_MAX_LENGTH = 2000;

export function buildFeedbackDiscussionUrl(opts: {
  rating: FeedbackRating;
  comment: string;
  endedReason?: string | null;
}): string {
  const label = opts.rating === 'up' ? '👍 Good' : '👎 Bad';
  const comment = opts.comment.trim().slice(0, FEEDBACK_COMMENT_MAX_LENGTH);
  const body = [
    `**Rating:** ${label}`,
    ...(opts.endedReason ? [`**Meeting ended:** ${opts.endedReason}`] : []),
    '',
    '**Comment:**',
    '',
    comment,
  ].join('\n');
  const params = new URLSearchParams({
    category: FEEDBACK_DISCUSSION_CATEGORY,
    title: `Meeting feedback: ${label}`,
    body,
  });
  return `${FEEDBACK_DISCUSSION_URL}?${params.toString()}`;
}
