const ja = {
  lang: '日本語',

  home_tagline: '会話が出会う場所、サーバーレスで。',
  home_description:
    'プライベートなビデオルームを数秒で立ち上げましょう。純粋なピアツーピアの WebRTC — アカウントもサーバーも仲介者も不要。あなたと仲間と、6文字のコードだけ。',
  home_your_name: 'お名前',
  home_host: '新しいミーティングを開始',
  home_or_join: 'または参加',
  home_meeting_code: 'ミーティングコード',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: '参加',
  home_error_name: 'お名前を入力してください。',
  home_error_code: 'ミーティングコードは6文字である必要があります。',
  home_footnote: 'WebRTC によるピアツーピア。アカウントもサーバーも不要。',

  footer_author: '作者',
  footer_github: 'GitHub',
  footer_feedback: 'フィードバック',

  meeting_invalid_code: '無効なミーティングコード',
  meeting_back_home: 'ホームに戻る',
  meeting_join_title: 'ミーティングに参加',
  meeting_enter_name: '続行するにはお名前を入力してください。',
  meeting_your_name: 'お名前',
  meeting_join: '参加',

  meeting_preparing: 'カメラとマイクを準備しています…',
  meeting_starting: 'ミーティングを開始しています…',
  meeting_joining: 'ミーティングに参加しています…',

  meeting_error_title: 'ミーティングに参加できませんでした',
  meeting_error_default: 'エラーが発生しました。',
  meeting_error_unavailable_id:
    'このミーティングコードはすでに使用されています。別のコードをお試しください。',
  meeting_error_peer_unavailable: 'ミーティングが見つかりません。',
  meeting_error_start: 'ミーティングの開始に失敗しました。',

  meeting_ended_host: 'ホストがミーティングを終了しました',
  meeting_ended_self: 'ミーティングを退出しました',
  meeting_ended_kicked: 'ホストによってミーティングから退出させられました',

  meeting_share_invite_aria: '招待を共有',
  meeting_person: '人',
  meeting_people: '人',

  meeting_end_for_everyone: '全員のミーティングを終了しますか？',
  meeting_leave_title: 'ミーティングから退出しますか？',
  meeting_end_for_everyone_body:
    'あなたはホストです。ミーティングを終了すると全員が切断されます。',
  meeting_leave_body: 'このミーティングから切断されます。',
  meeting_cancel: 'キャンセル',
  meeting_end: 'ミーティングを終了',
  meeting_leave: '退出',

  chat_title: 'チャット',
  chat_close: 'チャットを閉じる',
  chat_send: 'メッセージを送信',
  chat_emoji: '絵文字を挿入',
  chat_placeholder: 'メッセージ…',
  chat_empty: 'まだメッセージはありません。',
  chat_you: 'あなた',
  chat_system_joined: (name: string) => `${name} が参加しました`,
  chat_system_left: (name: string) => `${name} が退出しました`,

  controls_mute: 'ミュート',
  controls_unmute: 'ミュート解除',
  controls_stop_video: 'ビデオを停止',
  controls_start_video: 'ビデオを開始',
  controls_chat: 'チャット',
  controls_share: '招待を共有',
  controls_participants: '参加者',
  controls_leave: '退出',

  participants_title: '参加者',
  participants_close: '参加者を閉じる',
  participants_host: 'ホスト',
  participants_you: 'あなた',
  participants_kick: 'ミーティングから削除',
  participants_kick_confirm_title: '参加者を削除しますか？',
  participants_kick_confirm_body: (name: string) =>
    `${name} はこのミーティングから削除されます。`,
  participants_kick_confirm: '削除',
  participants_system_kicked: (name: string) => `${name} が削除されました`,

  rail_resize: 'パネルのサイズ変更',

  share_title: '他のユーザーを招待',
  share_meeting_code: 'ミーティングコード',
  share_copy_code: 'コードをコピー',
  share_copy_link: 'リンクをコピー',
  share_copied: 'コピーしました',
  share_invite_link: '招待リンク',
  share_via: '共有先',
  share_more: 'その他…',
  share_more_aria: 'その他の共有オプション',
  share_done: '完了',
  share_on: (network: string) => `${network} で共有`,
  share_subject: '私のミーティングに参加してください',
  share_text: (code: string) => `私のミーティングに参加してください（コード: ${code}）`,

  tile_you: '(あなた)',
  tile_host: 'ホスト',

  theme_switch_to: (mode: string) => `${mode}モードに切り替え`,
  theme_dark: 'ダーク',
  theme_light: 'ライト',

  language_change: '言語を変更',
} as const;

export default ja;
