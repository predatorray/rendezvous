const ko = {
  lang: '한국어',

  home_tagline: '대화가 만나는 곳, 서버 없이.',
  home_description:
    '몇 초 만에 비공개 화상 회의실을 만드세요. 순수 P2P WebRTC — 계정도, 서버도, 중개자도 없습니다. 당신과 사람들, 그리고 여섯 글자 코드만 있으면 됩니다.',
  home_your_name: '이름',
  home_host: '새 회의 시작',
  home_or_join: '또는 참여',
  home_meeting_code: '회의 코드',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: '참여',
  home_name_required_hint: '주최하거나 참여하려면 이름을 입력하세요.',
  home_error_name: '이름을 입력해 주세요.',
  home_error_code: '회의 코드는 6글자여야 합니다.',
  home_footnote: 'WebRTC를 통한 P2P. 계정도 서버도 없습니다.',

  footer_author: '제작자',
  footer_github: 'GitHub',
  footer_feedback: '피드백',

  meeting_invalid_code: '잘못된 회의 코드',
  meeting_back_home: '홈으로 돌아가기',
  meeting_join_title: '회의 참여',
  meeting_enter_name: '계속하려면 이름을 입력해 주세요.',
  meeting_your_name: '이름',
  meeting_join: '참여',

  meeting_preparing: '카메라와 마이크를 준비하는 중…',
  meeting_starting: '회의를 시작하는 중…',
  meeting_joining: '회의에 참여하는 중…',

  meeting_error_title: '회의에 참여할 수 없습니다',
  meeting_error_default: '오류가 발생했습니다.',
  meeting_error_unavailable_id:
    '이미 사용 중인 회의 코드입니다. 다른 코드를 사용해 보세요.',
  meeting_error_peer_unavailable: '회의를 찾을 수 없습니다.',
  meeting_error_start: '회의를 시작하지 못했습니다.',

  meeting_ended_host: '호스트가 회의를 종료했습니다',
  meeting_ended_self: '회의에서 나갔습니다',
  meeting_ended_kicked: '호스트에 의해 회의에서 내보내졌습니다',

  meeting_share_invite_aria: '초대 공유',
  meeting_person: '명',
  meeting_people: '명',

  meeting_end_for_everyone: '모두에 대해 회의를 종료할까요?',
  meeting_leave_title: '회의에서 나갈까요?',
  meeting_end_for_everyone_body:
    '당신은 호스트입니다. 회의를 종료하면 모두 연결이 끊깁니다.',
  meeting_leave_body: '이 회의에서 연결이 끊깁니다.',
  meeting_cancel: '취소',
  meeting_end: '회의 종료',
  meeting_leave: '나가기',

  chat_title: '채팅',
  chat_close: '채팅 닫기',
  chat_send: '메시지 보내기',
  chat_emoji: '이모지 삽입',
  chat_placeholder: '메시지…',
  chat_empty: '아직 메시지가 없습니다.',
  chat_you: '나',
  chat_system_joined: (name: string) => `${name}님이 참여했습니다`,
  chat_system_left: (name: string) => `${name}님이 나갔습니다`,

  controls_mute: '음소거',
  controls_unmute: '음소거 해제',
  controls_stop_video: '비디오 중지',
  controls_start_video: '비디오 시작',
  controls_chat: '채팅',
  controls_share: '초대 공유',
  controls_participants: '참가자',
  controls_leave: '나가기',

  participants_title: '참가자',
  participants_close: '참가자 닫기',
  participants_host: '호스트',
  participants_you: '나',
  participants_kick: '회의에서 내보내기',
  participants_kick_confirm_title: '참가자를 내보낼까요?',
  participants_kick_confirm_body: (name: string) =>
    `${name}님이 이 회의에서 내보내집니다.`,
  participants_kick_confirm: '내보내기',
  participants_system_kicked: (name: string) => `${name}님이 내보내졌습니다`,

  rail_resize: '패널 크기 조정',

  share_title: '다른 사람 초대',
  share_meeting_code: '회의 코드',
  share_copy_code: '코드 복사',
  share_copy_link: '링크 복사',
  share_copied: '복사됨',
  share_invite_link: '초대 링크',
  share_via: '공유 방법',
  share_more: '더 보기…',
  share_more_aria: '추가 공유 옵션',
  share_done: '완료',
  share_on: (network: string) => `${network}에 공유`,
  share_subject: '내 회의에 참여하세요',
  share_text: (code: string) => `내 회의에 참여하세요 (코드: ${code})`,

  tile_you: '(나)',
  tile_host: '호스트',

  theme_switch_to: (mode: string) => `${mode} 모드로 전환`,
  theme_dark: '다크',
  theme_light: '라이트',

  language_change: '언어 변경',
} as const;

export default ko;
