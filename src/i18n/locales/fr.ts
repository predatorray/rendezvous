const fr = {
  lang: 'Français',

  home_tagline: 'Rendez-vous, sans serveur.',
  home_description:
    'Créez une salle vidéo privée en quelques secondes. WebRTC pair-à-pair pur — pas de comptes, pas de serveurs, pas d’intermédiaires. Juste vous, vos proches et un code à six lettres.',
  home_your_name: 'Votre nom',
  home_host: 'Lancer une réunion',
  home_or_join: 'ou rejoindre',
  home_meeting_code: 'Code de la réunion',
  home_meeting_code_placeholder: 'abcxyz',
  home_join: 'Rejoindre',
  home_error_name: 'Veuillez entrer votre nom.',
  home_error_code: 'Le code de la réunion doit comporter 6 lettres.',
  home_footnote: 'Pair-à-pair via WebRTC. Pas de comptes, pas de serveurs.',

  footer_author: 'Auteur',
  footer_github: 'GitHub',
  footer_feedback: 'Retour',

  meeting_invalid_code: 'Code de réunion invalide',
  meeting_back_home: 'Retour à l’accueil',
  meeting_join_title: 'Rejoindre la réunion',
  meeting_enter_name: 'Veuillez entrer votre nom pour continuer.',
  meeting_your_name: 'Votre nom',
  meeting_join: 'Rejoindre',

  meeting_preparing: 'Préparation de votre caméra et de votre microphone…',
  meeting_starting: 'Démarrage de la réunion…',
  meeting_joining: 'Connexion à la réunion…',

  meeting_error_title: 'Impossible de rejoindre la réunion',
  meeting_error_default: 'Une erreur est survenue.',
  meeting_error_unavailable_id:
    'Ce code de réunion est déjà utilisé. Essayez-en un autre.',
  meeting_error_peer_unavailable: 'Réunion introuvable.',
  meeting_error_start: 'Échec du démarrage de la réunion.',

  meeting_ended_host: 'L’hôte a mis fin à la réunion',
  meeting_ended_self: 'Vous avez quitté la réunion',
  meeting_ended_kicked: 'Vous avez été retiré de la réunion par l’hôte',

  meeting_share_invite_aria: 'Partager l’invitation',
  meeting_person: 'personne',
  meeting_people: 'personnes',

  meeting_end_for_everyone: 'Mettre fin à la réunion pour tout le monde ?',
  meeting_leave_title: 'Quitter la réunion ?',
  meeting_end_for_everyone_body:
    'Vous êtes l’hôte. Mettre fin à la réunion déconnectera tout le monde.',
  meeting_leave_body: 'Vous serez déconnecté de cette réunion.',
  meeting_cancel: 'Annuler',
  meeting_end: 'Mettre fin',
  meeting_leave: 'Quitter',

  chat_title: 'Discussion',
  chat_close: 'Fermer la discussion',
  chat_send: 'Envoyer le message',
  chat_emoji: 'Insérer un emoji',
  chat_placeholder: 'Message…',
  chat_empty: 'Pas encore de messages.',
  chat_you: 'Vous',
  chat_system_joined: (name: string) => `${name} a rejoint`,
  chat_system_left: (name: string) => `${name} a quitté la réunion`,

  controls_mute: 'Couper le micro',
  controls_unmute: 'Activer le micro',
  controls_stop_video: 'Couper la vidéo',
  controls_start_video: 'Activer la vidéo',
  controls_chat: 'Discussion',
  controls_share: 'Partager l’invitation',
  controls_participants: 'Participants',
  controls_leave: 'Quitter',

  participants_title: 'Participants',
  participants_close: 'Fermer la liste des participants',
  participants_host: 'Hôte',
  participants_you: 'Vous',
  participants_kick: 'Retirer de la réunion',
  participants_kick_confirm_title: 'Retirer le participant ?',
  participants_kick_confirm_body: (name: string) =>
    `${name} sera retiré de cette réunion.`,
  participants_kick_confirm: 'Retirer',
  participants_system_kicked: (name: string) => `${name} a été retiré`,

  rail_resize: 'Redimensionner les panneaux',

  share_title: 'Inviter d’autres personnes',
  share_meeting_code: 'Code de la réunion',
  share_copy_code: 'Copier le code',
  share_copy_link: 'Copier le lien',
  share_copied: 'Copié',
  share_invite_link: 'Lien d’invitation',
  share_via: 'Partager via',
  share_more: 'Plus…',
  share_more_aria: 'Plus d’options de partage',
  share_done: 'Terminé',
  share_on: (network: string) => `Partager sur ${network}`,
  share_subject: 'Rejoignez ma réunion',
  share_text: (code: string) => `Rejoignez ma réunion (code : ${code})`,

  tile_you: '(vous)',
  tile_host: 'Hôte',

  theme_switch_to: (mode: string) => `Passer en mode ${mode}`,
  theme_dark: 'sombre',
  theme_light: 'clair',

  language_change: 'Changer de langue',
} as const;

export default fr;
