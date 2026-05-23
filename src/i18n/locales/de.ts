const de = {
  lang: 'Deutsch',

  home_tagline: 'Wo Gespräche sich treffen – serverlos.',
  home_description:
    'Erstelle in Sekunden einen privaten Videoraum. Reines Peer-to-Peer-WebRTC – keine Konten, keine Server, keine Vermittler. Nur du, deine Leute und ein Code aus sechs Buchstaben.',
  home_your_name: 'Dein Name',
  home_host: 'Neues Meeting starten',
  home_or_join: 'oder beitreten',
  home_meeting_code: 'Meeting-Code',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: 'Beitreten',
  home_name_required_hint: 'Gib deinen Namen ein, um zu hosten oder beizutreten.',
  home_error_name: 'Bitte gib deinen Namen ein.',
  home_error_code: 'Der Meeting-Code muss aus 6 Buchstaben bestehen.',
  home_footnote: 'Peer-to-Peer über WebRTC. Keine Konten, keine Server.',

  footer_author: 'Autor',
  footer_github: 'GitHub',
  footer_feedback: 'Feedback',

  meeting_invalid_code: 'Ungültiger Meeting-Code',
  meeting_back_home: 'Zurück zur Startseite',
  meeting_join_title: 'Meeting beitreten',
  meeting_enter_name: 'Bitte gib deinen Namen ein, um fortzufahren.',
  meeting_your_name: 'Dein Name',
  meeting_join: 'Beitreten',

  meeting_preparing: 'Kamera und Mikrofon werden vorbereitet…',
  meeting_starting: 'Meeting wird gestartet…',
  meeting_joining: 'Meeting wird beigetreten…',

  meeting_error_title: 'Beitritt zum Meeting fehlgeschlagen',
  meeting_error_default: 'Ein Fehler ist aufgetreten.',
  meeting_error_unavailable_id:
    'Dieser Meeting-Code wird bereits verwendet. Versuche einen anderen.',
  meeting_error_peer_unavailable: 'Meeting nicht gefunden.',
  meeting_error_start: 'Meeting konnte nicht gestartet werden.',

  meeting_ended_host: 'Der Host hat das Meeting beendet',
  meeting_ended_self: 'Du hast das Meeting verlassen',
  meeting_ended_kicked: 'Du wurdest vom Host aus dem Meeting entfernt',

  meeting_share_invite_aria: 'Einladung teilen',
  meeting_person: 'Person',
  meeting_people: 'Personen',

  meeting_end_for_everyone: 'Meeting für alle beenden?',
  meeting_leave_title: 'Meeting verlassen?',
  meeting_end_for_everyone_body:
    'Du bist der Host. Wenn du das Meeting beendest, werden alle getrennt.',
  meeting_leave_body: 'Du wirst von diesem Meeting getrennt.',
  meeting_cancel: 'Abbrechen',
  meeting_end: 'Meeting beenden',
  meeting_leave: 'Verlassen',

  chat_title: 'Chat',
  chat_close: 'Chat schließen',
  chat_send: 'Nachricht senden',
  chat_emoji: 'Emoji einfügen',
  chat_placeholder: 'Nachricht…',
  chat_empty: 'Noch keine Nachrichten.',
  chat_you: 'Du',
  chat_system_joined: (name: string) => `${name} ist beigetreten`,
  chat_system_left: (name: string) => `${name} hat das Meeting verlassen`,

  controls_mute: 'Stummschalten',
  controls_unmute: 'Stummschaltung aufheben',
  controls_stop_video: 'Video stoppen',
  controls_start_video: 'Video starten',
  controls_chat: 'Chat',
  controls_share: 'Einladung teilen',
  controls_participants: 'Teilnehmer',
  controls_leave: 'Verlassen',

  participants_title: 'Teilnehmer',
  participants_close: 'Teilnehmer schließen',
  participants_host: 'Host',
  participants_you: 'Du',
  participants_kick: 'Aus Meeting entfernen',
  participants_kick_confirm_title: 'Teilnehmer entfernen?',
  participants_kick_confirm_body: (name: string) =>
    `${name} wird aus diesem Meeting entfernt.`,
  participants_kick_confirm: 'Entfernen',
  participants_system_kicked: (name: string) => `${name} wurde entfernt`,

  rail_resize: 'Panels anpassen',

  share_title: 'Andere einladen',
  share_meeting_code: 'Meeting-Code',
  share_copy_code: 'Code kopieren',
  share_copy_link: 'Link kopieren',
  share_copied: 'Kopiert',
  share_invite_link: 'Einladungslink',
  share_via: 'Teilen über',
  share_more: 'Mehr…',
  share_more_aria: 'Weitere Freigabeoptionen',
  share_done: 'Fertig',
  share_on: (network: string) => `Auf ${network} teilen`,
  share_subject: 'Tritt meinem Meeting bei',
  share_text: (code: string) => `Tritt meinem Meeting bei (Code: ${code})`,

  tile_you: '(du)',
  tile_host: 'Host',

  theme_switch_to: (mode: string) => `In den ${mode} wechseln`,
  theme_dark: 'Dunkelmodus',
  theme_light: 'Hellmodus',

  language_change: 'Sprache ändern',
} as const;

export default de;
