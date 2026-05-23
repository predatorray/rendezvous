const zh = {
  lang: '中文',

  home_tagline: '海内存知己，天涯若比邻。',
  home_description:
    '几秒钟内创建私密视频房间。纯点对点 WebRTC —— 无需账号、无需服务器、无中间人。只需你、你的伙伴，以及一个六字母的代码。',
  home_your_name: '你的名字',
  home_host: '发起会议',
  home_or_join: '或加入',
  home_meeting_code: '会议代码',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: '加入',
  home_name_required_hint: '请输入你的名字以创建或加入会议。',
  home_error_name: '请输入你的名字。',
  home_error_code: '会议代码必须是 6 个字母。',
  home_footnote: '基于 WebRTC 的点对点连接。无账号，无服务器。',

  footer_author: '作者',
  footer_github: 'GitHub',
  footer_feedback: '反馈',

  meeting_invalid_code: '无效的会议代码',
  meeting_back_home: '返回首页',
  meeting_join_title: '加入会议',
  meeting_enter_name: '请输入你的名字以继续。',
  meeting_your_name: '你的名字',
  meeting_join: '加入',

  meeting_preparing: '正在准备摄像头和麦克风…',
  meeting_starting: '正在开始会议…',
  meeting_joining: '正在加入会议…',

  meeting_error_title: '无法加入会议',
  meeting_error_default: '发生了错误。',
  meeting_error_unavailable_id: '该会议代码正在被使用，请换一个。',
  meeting_error_peer_unavailable: '未找到会议。',
  meeting_error_start: '无法开始会议。',

  meeting_ended_host: '主持人已结束会议',
  meeting_ended_self: '你已离开会议',
  meeting_ended_kicked: '你已被主持人移出会议',

  meeting_share_invite_aria: '分享邀请',
  meeting_person: '人',
  meeting_people: '人',

  meeting_end_for_everyone: '为所有人结束会议？',
  meeting_leave_title: '离开会议？',
  meeting_end_for_everyone_body: '你是主持人。结束会议将断开所有人的连接。',
  meeting_leave_body: '你将从这个会议中断开连接。',
  meeting_cancel: '取消',
  meeting_end: '结束会议',
  meeting_leave: '离开',

  chat_title: '聊天',
  chat_close: '关闭聊天',
  chat_send: '发送消息',
  chat_emoji: '插入表情',
  chat_placeholder: '消息…',
  chat_empty: '还没有消息。',
  chat_you: '你',
  chat_system_joined: (name: string) => `${name} 加入了会议`,
  chat_system_left: (name: string) => `${name} 离开了会议`,

  controls_mute: '静音',
  controls_unmute: '取消静音',
  controls_stop_video: '停止视频',
  controls_start_video: '开启视频',
  controls_chat: '聊天',
  controls_share: '分享邀请',
  controls_participants: '参会者',
  controls_leave: '离开',

  participants_title: '参会者',
  participants_close: '关闭参会者列表',
  participants_host: '主持人',
  participants_you: '你',
  participants_kick: '移出会议',
  participants_kick_confirm_title: '移出参会者？',
  participants_kick_confirm_body: (name: string) => `${name} 将被移出此会议。`,
  participants_kick_confirm: '移出',
  participants_system_kicked: (name: string) => `${name} 已被移出会议`,

  rail_resize: '调整面板大小',

  share_title: '邀请他人',
  share_meeting_code: '会议代码',
  share_copy_code: '复制代码',
  share_copy_link: '复制链接',
  share_copied: '已复制',
  share_invite_link: '邀请链接',
  share_via: '分享至',
  share_more: '更多…',
  share_more_aria: '更多分享选项',
  share_done: '完成',
  share_on: (network: string) => `分享到 ${network}`,
  share_subject: '加入我的会议',
  share_text: (code: string) => `加入我的会议（代码：${code}）`,

  tile_you: '（你）',
  tile_host: '主持人',

  theme_switch_to: (mode: string) => `切换到${mode}模式`,
  theme_dark: '深色',
  theme_light: '浅色',

  language_change: '切换语言',

  // 已验证会议（实验性）
  verify_toggle_label: '已验证会议',
  verify_experimental_tag: '实验性',
  verify_toggle_hint: '访客通过通行密钥以加密方式验证确实是你在主持。',
  verify_unsupported: '此浏览器不支持通行密钥。',
  verify_host_button: '主持已验证会议',
  verify_create_failed: '无法创建你的通行密钥身份。',

  verify_host_unlock_title: '解锁以主持',
  verify_host_unlock_body: '用你的通行密钥确认，以便访客能验证这场会议确实由你主持。',
  verify_host_unlock_cta: '用通行密钥验证',
  verify_host_unlocking: '正在等待通行密钥…',
  verify_host_unlock_failed: '通行密钥验证失败。',

  verify_waiting_title: '正在等待主持人',
  verify_waiting_body: '会议尚未开始。主持人到场后你将自动加入。',
  verify_checking: '正在验证主持人身份…',

  verify_badge_host: '已验证主持人',
  verify_badge_verified: '已验证',
  verify_badge_pending: '验证中…',

  verify_error_timeout: '主持人未响应身份验证。',
  verify_error_unavailable: '无法验证此会议。主持人未启用验证，或有人可能在冒充主持人。',
  verify_error_failed:
    '无法验证主持人身份。请勿分享任何敏感信息——你可能并非在与真正的主持人通话。',

  share_fingerprint_label: '主持人指纹',
  share_copy_fingerprint: '复制指纹',
  share_fingerprint_hint:
    '请通过另一渠道（当面、电话）分享此指纹。访客可对照确认没有冒充者。',

  verify_identity_view: '查看主持人身份',
  verify_identity_title: '主持人身份',
  verify_identity_body_host: '这是本次会议的指纹。收到它的访客可据此确认确实联系到了你。',
  verify_identity_status_verified: '该主持人的身份已通过加密验证。',
  verify_identity_status_pending: '正在验证主持人身份…',
  verify_identity_compare_hint:
    '请将此指纹与主持人通过其他方式（当面、电话、已签名的消息）告知你的指纹进行对照。若不一致，链接可能已被篡改——请勿信任该会议。',
} as const;

export default zh;
