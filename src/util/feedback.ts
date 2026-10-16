export type FeedbackRating = 'up' | 'down';

export const FEEDBACK_DISCUSSION_URL =
  'https://github.com/predatorray/rendezvous/discussions/new';
export const FEEDBACK_DISCUSSION_CATEGORY = 'general';
export const FEEDBACK_COMMENT_MAX_LENGTH = 2000;
// GitHub rejects URLs much past ~8 KB. Non-ASCII text (CJK, Cyrillic, emoji)
// percent-encodes to several bytes per character, so the budget is applied
// to the encoded URL rather than the comment's character count.
export const FEEDBACK_URL_MAX_LENGTH = 6000;

function buildUrl(
  label: string,
  comment: string,
  endedReason?: string | null
): string {
  const body = [
    `**Rating:** ${label}`,
    ...(endedReason ? [`**Meeting ended:** ${endedReason}`] : []),
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

export function buildFeedbackDiscussionUrl(opts: {
  rating: FeedbackRating;
  comment: string;
  endedReason?: string | null;
}): string {
  const label = opts.rating === 'up' ? '👍 Good' : '👎 Bad';
  // Split by code point so truncation never cuts a surrogate pair in half.
  const chars = Array.from(opts.comment.trim()).slice(
    0,
    FEEDBACK_COMMENT_MAX_LENGTH
  );
  const full = buildUrl(label, chars.join(''), opts.endedReason);
  if (full.length <= FEEDBACK_URL_MAX_LENGTH) return full;

  // Binary search for the longest prefix (plus an ellipsis) that fits.
  let lo = 0;
  let hi = chars.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const url = buildUrl(
      label,
      chars.slice(0, mid).join('') + '…',
      opts.endedReason
    );
    if (url.length <= FEEDBACK_URL_MAX_LENGTH) lo = mid;
    else hi = mid - 1;
  }
  return buildUrl(label, chars.slice(0, lo).join('') + '…', opts.endedReason);
}
