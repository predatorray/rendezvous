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
  home_name_required_hint: '主催または参加するには名前を入力してください。',
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

  // 検証済みミーティング（実験的）
  verify_toggle_label: '検証済みミーティング',
  verify_experimental_tag: '実験的',
  verify_toggle_hint:
    'ゲストはパスキーを使って、本当にあなたが主催していることを暗号的に検証します。',
  verify_unsupported: 'このブラウザはパスキーに対応していません。',
  verify_host_button: '検証済みミーティングを主催',
  verify_create_failed: 'パスキーIDを作成できませんでした。',

  verify_host_unlock_title: '主催するにはロック解除',
  verify_host_unlock_body:
    'パスキーで確認すると、ゲストはこのミーティングを本当にあなたが主催していることを検証できます。',
  verify_host_unlock_cta: 'パスキーで確認',
  verify_host_unlocking: 'パスキーを待っています…',
  verify_host_unlock_failed: 'パスキーの検証に失敗しました。',

  verify_waiting_title: 'ホストを待っています',
  verify_waiting_body:
    'このミーティングはまだ開始されていません。ホストが参加すると自動的に参加します。',
  verify_waiting_host_question: 'あなたがホストですか？',
  verify_waiting_host_cta: 'このミーティングを主催',
  verify_checking: 'ホストの本人確認中…',

  verify_badge_host: '検証済みホスト',
  verify_badge_verified: '検証済み',
  verify_badge_pending: '検証中…',

  verify_error_timeout: 'ホストが本人確認に応答しませんでした。',
  verify_error_unavailable:
    'このミーティングを検証できませんでした。ホストが検証を有効にしていないか、誰かがなりすましている可能性があります。',
  verify_error_failed:
    'ホストの本人確認ができませんでした。機密情報は共有しないでください。本物のホストと話していない可能性があります。',

  share_fingerprint_label: 'ホストのフィンガープリント',
  share_copy_fingerprint: 'フィンガープリントをコピー',
  share_fingerprint_hint:
    'このフィンガープリントを別の手段（対面・通話）で共有してください。ゲストは照合してなりすましがないことを確認できます。',

  verify_identity_view: 'ホストの身元を表示',
  verify_identity_title: 'ホストの身元',
  verify_identity_body_host:
    'これはこのミーティングのフィンガープリントです。これを伝えたゲストは、本当にあなたに接続できたことを確認できます。',
  verify_identity_status_verified: 'このホストの身元は暗号的に検証されました。',
  verify_identity_status_pending: 'ホストの身元を検証中…',
  verify_identity_compare_hint:
    'ホストから別の手段（対面・通話・署名付きメッセージ）で伝えられたフィンガープリントと照合してください。一致しない場合、リンクが改ざんされている可能性があります。そのミーティングを信用しないでください。',
} as const;

export default ja;
