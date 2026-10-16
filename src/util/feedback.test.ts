import {
  buildFeedbackDiscussionUrl,
  FEEDBACK_COMMENT_MAX_LENGTH,
  FEEDBACK_DISCUSSION_URL,
  FEEDBACK_URL_MAX_LENGTH,
} from './feedback';

function parse(url: string) {
  const u = new URL(url);
  return { base: `${u.origin}${u.pathname}`, params: u.searchParams };
}

describe('buildFeedbackDiscussionUrl', () => {
  it('prefills category, title and body', () => {
    const { base, params } = parse(
      buildFeedbackDiscussionUrl({
        rating: 'up',
        comment: '  Great call & clear audio  ',
        endedReason: 'host-left',
      })
    );
    expect(base).toBe(FEEDBACK_DISCUSSION_URL);
    expect(params.get('category')).toBe('general');
    expect(params.get('title')).toBe('Meeting feedback: 👍 Good');
    const body = params.get('body')!;
    expect(body).toContain('**Rating:** 👍 Good');
    expect(body).toContain('**Meeting ended:** host-left');
    expect(body).toContain('Great call & clear audio');
    expect(body).not.toContain('  Great');
  });

  it('labels thumbs down and omits a missing ended reason', () => {
    const { params } = parse(
      buildFeedbackDiscussionUrl({ rating: 'down', comment: 'laggy' })
    );
    expect(params.get('title')).toBe('Meeting feedback: 👎 Bad');
    expect(params.get('body')).not.toContain('Meeting ended');
  });

  it('truncates very long comments', () => {
    const { params } = parse(
      buildFeedbackDiscussionUrl({
        rating: 'up',
        comment: 'x'.repeat(FEEDBACK_COMMENT_MAX_LENGTH + 500),
      })
    );
    const xs = params.get('body')!.match(/x+/)![0];
    expect(xs).toHaveLength(FEEDBACK_COMMENT_MAX_LENGTH);
  });

  it.each([
    ['CJK', '会'],
    ['Cyrillic', 'ж'],
    ['emoji', '😀'],
  ])('keeps the encoded URL within budget for long %s comments', (_, ch) => {
    const url = buildFeedbackDiscussionUrl({
      rating: 'up',
      comment: ch.repeat(FEEDBACK_COMMENT_MAX_LENGTH),
      endedReason: 'self-left',
    });
    expect(url.length).toBeLessThanOrEqual(FEEDBACK_URL_MAX_LENGTH);
    const body = new URL(url).searchParams.get('body')!;
    expect(body).toContain('**Rating:** 👍 Good');
    expect(body.endsWith('…')).toBe(true);
    // Truncation must not split a surrogate pair.
    expect(body).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
    expect(body).toContain(ch.repeat(100));
  });
});
