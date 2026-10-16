import { useState } from 'react';
import {
  Button,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { useT } from '../i18n/useLangContext';
import { trackEvent } from '../util/analytics';
import {
  buildFeedbackDiscussionUrl,
  FEEDBACK_COMMENT_MAX_LENGTH,
  FeedbackRating,
} from '../util/feedback';

export default function MeetingFeedback({
  endedReason,
}: {
  endedReason?: string | null;
}) {
  const t = useT();
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        {t.feedback_thanks}
      </Typography>
    );
  }

  const hasComment = comment.trim().length > 0;

  const submit = () => {
    if (!rating) return;
    trackEvent('meeting_feedback', {
      rating,
      has_comment: hasComment,
      ended_reason: endedReason ?? 'unknown',
    });
    setSubmitted(true);
  };

  // With a comment, the submit button is a real link with target="_blank":
  // a user-initiated anchor navigation isn't subject to popup blocking the
  // way window.open() can be.
  const linkProps =
    rating && hasComment
      ? {
          component: 'a' as const,
          href: buildFeedbackDiscussionUrl({ rating, comment, endedReason }),
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

  return (
    <Stack spacing={2} alignItems="stretch">
      <Typography variant="subtitle1">{t.feedback_title}</Typography>
      <ToggleButtonGroup
        exclusive
        value={rating}
        onChange={(_, v: FeedbackRating | null) => setRating(v)}
        sx={{ alignSelf: 'center' }}
      >
        <ToggleButton value="up" aria-label={t.feedback_good}>
          <ThumbUpOutlinedIcon />
        </ToggleButton>
        <ToggleButton value="down" aria-label={t.feedback_bad}>
          <ThumbDownOutlinedIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      {rating && (
        <>
          <TextField
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.feedback_comment_placeholder}
            slotProps={{
              htmlInput: {
                maxLength: FEEDBACK_COMMENT_MAX_LENGTH,
                'aria-label': t.feedback_comment_placeholder,
              },
            }}
          />
          {hasComment && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {t.feedback_github_hint}
            </Typography>
          )}
          <Button
            variant="outlined"
            onClick={submit}
            sx={{ textTransform: 'none' }}
            {...linkProps}
          >
            {t.feedback_submit}
          </Button>
        </>
      )}
    </Stack>
  );
}
