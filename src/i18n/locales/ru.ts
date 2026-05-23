const ru = {
  lang: 'Русский',

  home_tagline: 'Место встречи разговоров — без серверов.',
  home_description:
    'Создайте приватную видеокомнату за секунды. Чистый P2P WebRTC — без аккаунтов, серверов и посредников. Только вы, ваши люди и код из шести букв.',
  home_your_name: 'Ваше имя',
  home_host: 'Создать встречу',
  home_or_join: 'или присоединиться',
  home_meeting_code: 'Код встречи',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: 'Войти',
  home_name_required_hint:
    'Введите имя, чтобы создать встречу или присоединиться.',
  home_error_name: 'Пожалуйста, введите ваше имя.',
  home_error_code: 'Код встречи должен состоять из 6 букв.',
  home_footnote: 'P2P через WebRTC. Без аккаунтов и серверов.',

  footer_author: 'Автор',
  footer_github: 'GitHub',
  footer_feedback: 'Обратная связь',

  meeting_invalid_code: 'Неверный код встречи',
  meeting_back_home: 'На главную',
  meeting_join_title: 'Присоединиться к встрече',
  meeting_enter_name: 'Пожалуйста, введите имя, чтобы продолжить.',
  meeting_your_name: 'Ваше имя',
  meeting_join: 'Войти',

  meeting_preparing: 'Подготовка камеры и микрофона…',
  meeting_starting: 'Запуск встречи…',
  meeting_joining: 'Подключение к встрече…',

  meeting_error_title: 'Не удалось присоединиться к встрече',
  meeting_error_default: 'Произошла ошибка.',
  meeting_error_unavailable_id:
    'Этот код встречи уже используется. Попробуйте другой.',
  meeting_error_peer_unavailable: 'Встреча не найдена.',
  meeting_error_start: 'Не удалось запустить встречу.',

  meeting_ended_host: 'Организатор завершил встречу',
  meeting_ended_self: 'Вы покинули встречу',
  meeting_ended_kicked: 'Организатор удалил вас из встречи',

  meeting_share_invite_aria: 'Поделиться приглашением',
  meeting_person: 'участник',
  meeting_people: 'участников',

  meeting_end_for_everyone: 'Завершить встречу для всех?',
  meeting_leave_title: 'Покинуть встречу?',
  meeting_end_for_everyone_body:
    'Вы организатор. Завершение встречи отключит всех участников.',
  meeting_leave_body: 'Вы будете отключены от этой встречи.',
  meeting_cancel: 'Отмена',
  meeting_end: 'Завершить встречу',
  meeting_leave: 'Выйти',

  chat_title: 'Чат',
  chat_close: 'Закрыть чат',
  chat_send: 'Отправить сообщение',
  chat_emoji: 'Вставить эмодзи',
  chat_placeholder: 'Сообщение…',
  chat_empty: 'Сообщений пока нет.',
  chat_you: 'Вы',
  chat_system_joined: (name: string) => `${name} присоединился(ась)`,
  chat_system_left: (name: string) => `${name} вышел(ла)`,

  controls_mute: 'Выключить микрофон',
  controls_unmute: 'Включить микрофон',
  controls_stop_video: 'Выключить видео',
  controls_start_video: 'Включить видео',
  controls_chat: 'Чат',
  controls_share: 'Поделиться приглашением',
  controls_participants: 'Участники',
  controls_leave: 'Выйти',

  participants_title: 'Участники',
  participants_close: 'Закрыть участников',
  participants_host: 'Организатор',
  participants_you: 'Вы',
  participants_kick: 'Удалить из встречи',
  participants_kick_confirm_title: 'Удалить участника?',
  participants_kick_confirm_body: (name: string) =>
    `${name} будет удалён из этой встречи.`,
  participants_kick_confirm: 'Удалить',
  participants_system_kicked: (name: string) => `${name} удалён`,

  rail_resize: 'Изменить размер панелей',

  share_title: 'Пригласить других',
  share_meeting_code: 'Код встречи',
  share_copy_code: 'Копировать код',
  share_copy_link: 'Копировать ссылку',
  share_copied: 'Скопировано',
  share_invite_link: 'Ссылка-приглашение',
  share_via: 'Поделиться через',
  share_more: 'Ещё…',
  share_more_aria: 'Дополнительные варианты',
  share_done: 'Готово',
  share_on: (network: string) => `Поделиться в ${network}`,
  share_subject: 'Присоединяйтесь к моей встрече',
  share_text: (code: string) =>
    `Присоединяйтесь к моей встрече (код: ${code})`,

  tile_you: '(вы)',
  tile_host: 'Организатор',

  theme_switch_to: (mode: string) => `Переключить на ${mode} тему`,
  theme_dark: 'тёмную',
  theme_light: 'светлую',

  language_change: 'Изменить язык',
} as const;

export default ru;
