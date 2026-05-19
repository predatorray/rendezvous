const en = {
  lang: 'English',

  home_tagline: 'Where conversations meet, serverlessly.',
  home_description:
    'Spin up a private video room in seconds. Pure peer-to-peer WebRTC — no accounts, no servers, no middlemen. Just you, your people, and a six-letter code.',
  home_your_name: 'Your name',
  home_host: 'Host new meeting',
  home_or_join: 'or join',
  home_meeting_code: 'Meeting code',
  home_meeting_code_placeholder: 'abcxyz',
  home_join: 'Join',
  home_error_name: 'Please enter your name.',
  home_error_code: 'Meeting code must be 6 letters.',
  home_footnote: 'Peer-to-peer via WebRTC. No accounts, no servers.',

  footer_author: 'Author',
  footer_github: 'GitHub',
  footer_feedback: 'Feedback',

  meeting_invalid_code: 'Invalid meeting code',
  meeting_back_home: 'Back to home',
  meeting_join_title: 'Join meeting',
  meeting_enter_name: 'Please enter your name to continue.',
  meeting_your_name: 'Your name',
  meeting_join: 'Join',

  meeting_preparing: 'Preparing your camera and microphone…',
  meeting_starting: 'Starting meeting…',
  meeting_joining: 'Joining meeting…',

  meeting_error_title: 'Couldn’t join the meeting',
  meeting_error_default: 'An error occurred.',
  meeting_error_unavailable_id:
    'This meeting code is already in use. Try another.',
  meeting_error_peer_unavailable: 'Meeting not found.',
  meeting_error_start: 'Failed to start meeting.',

  meeting_ended_host: 'The host ended the meeting',
  meeting_ended_self: 'You left the meeting',
  meeting_ended_kicked: 'You were removed from the meeting by the host',

  meeting_share_invite_aria: 'Share invite',
  meeting_person: 'person',
  meeting_people: 'people',

  meeting_end_for_everyone: 'End meeting for everyone?',
  meeting_leave_title: 'Leave meeting?',
  meeting_end_for_everyone_body:
    'You are the host. Ending the meeting will disconnect everyone.',
  meeting_leave_body: 'You will be disconnected from this meeting.',
  meeting_cancel: 'Cancel',
  meeting_end: 'End meeting',
  meeting_leave: 'Leave',

  chat_title: 'Chat',
  chat_close: 'Close chat',
  chat_send: 'Send message',
  chat_emoji: 'Insert emoji',
  chat_placeholder: 'Message…',
  chat_empty: 'No messages yet.',
  chat_you: 'You',
  chat_system_joined: (name: string) => `${name} joined`,
  chat_system_left: (name: string) => `${name} left`,

  controls_mute: 'Mute',
  controls_unmute: 'Unmute',
  controls_stop_video: 'Stop video',
  controls_start_video: 'Start video',
  controls_chat: 'Chat',
  controls_share: 'Share invite',
  controls_participants: 'Participants',
  controls_leave: 'Leave',

  participants_title: 'Participants',
  participants_close: 'Close participants',
  participants_host: 'Host',
  participants_you: 'You',
  participants_kick: 'Remove from meeting',
  participants_kick_confirm_title: 'Remove participant?',
  participants_kick_confirm_body: (name: string) =>
    `${name} will be removed from this meeting.`,
  participants_kick_confirm: 'Remove',
  participants_system_kicked: (name: string) => `${name} was removed`,

  rail_resize: 'Resize panels',

  share_title: 'Invite others',
  share_meeting_code: 'Meeting code',
  share_copy_code: 'Copy code',
  share_copy_link: 'Copy link',
  share_copied: 'Copied',
  share_invite_link: 'Invite link',
  share_via: 'Share via',
  share_more: 'More…',
  share_more_aria: 'More sharing options',
  share_done: 'Done',
  share_on: (network: string) => `Share on ${network}`,
  share_subject: 'Join my meeting',
  share_text: (code: string) => `Join my meeting (code: ${code})`,

  tile_you: '(you)',
  tile_host: 'Host',

  theme_switch_to: (mode: string) => `Switch to ${mode} mode`,
  theme_dark: 'dark',
  theme_light: 'light',

  language_change: 'Change language',
} as const;

export default en;
