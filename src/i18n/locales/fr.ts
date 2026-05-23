const fr = {
  lang: 'Français',

  home_tagline: 'Rendez-vous, sans serveur.',
  home_description:
    'Créez une salle vidéo privée en quelques secondes. WebRTC pair-à-pair pur — pas de comptes, pas de serveurs, pas d’intermédiaires. Juste vous, vos proches et un code à six lettres.',
  home_your_name: 'Votre nom',
  home_host: 'Lancer une réunion',
  home_or_join: 'ou rejoindre',
  home_meeting_code: 'Code de la réunion',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: 'Rejoindre',
  home_name_required_hint: 'Entrez votre nom pour créer ou rejoindre.',
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

  // Réunion vérifiée (expérimental)
  verify_toggle_label: 'Réunion vérifiée',
  verify_experimental_tag: 'Expérimental',
  verify_toggle_hint:
    'Les invités vérifient de façon cryptographique que c’est bien vous qui animez, via une clé d’accès.',
  verify_unsupported:
    'Les clés d’accès ne sont pas prises en charge par ce navigateur.',
  verify_host_button: 'Animer une réunion vérifiée',
  verify_create_failed: 'Impossible de créer votre identité par clé d’accès.',

  verify_host_unlock_title: 'Déverrouiller pour animer',
  verify_host_unlock_body:
    'Confirmez avec votre clé d’accès afin que les invités puissent vérifier que cette réunion est bien animée par vous.',
  verify_host_unlock_cta: 'Vérifier avec la clé d’accès',
  verify_host_unlocking: 'En attente de la clé d’accès…',
  verify_host_unlock_failed: 'Échec de la vérification par clé d’accès.',

  verify_waiting_title: 'En attente de l’hôte',
  verify_waiting_body:
    'Cette réunion n’a pas encore commencé. Vous rejoindrez automatiquement dès que l’hôte arrivera.',
  verify_checking: 'Vérification de l’identité de l’hôte…',

  verify_badge_host: 'Hôte vérifié',
  verify_badge_verified: 'Vérifié',
  verify_badge_pending: 'Vérification…',

  verify_error_timeout: 'L’hôte n’a pas répondu à la vérification d’identité.',
  verify_error_unavailable:
    'Cette réunion n’a pas pu être vérifiée. L’hôte n’utilise pas la vérification, ou quelqu’un l’usurpe peut-être.',
  verify_error_failed:
    'L’identité de l’hôte n’a pas pu être vérifiée. Ne partagez rien de sensible : vous ne parlez peut-être pas au véritable hôte.',

  share_fingerprint_label: 'Empreinte de l’hôte',
  share_copy_fingerprint: 'Copier l’empreinte',
  share_fingerprint_hint:
    'Partagez cette empreinte par un autre canal (en personne, par appel). Les invités peuvent la comparer pour écarter tout imposteur.',

  verify_identity_view: 'Voir l’identité de l’hôte',
  verify_identity_title: 'Identité de l’hôte',
  verify_identity_body_host:
    'Voici l’empreinte de votre réunion. Les invités à qui vous l’avez communiquée peuvent confirmer qu’ils vous ont bien joint.',
  verify_identity_status_verified:
    'L’identité de cet hôte a été vérifiée de façon cryptographique.',
  verify_identity_status_pending: 'Vérification de l’identité de l’hôte…',
  verify_identity_compare_hint:
    'Comparez ceci avec l’empreinte que l’hôte vous a communiquée séparément (en personne, par appel, par message signé). Si elles ne correspondent pas, le lien a peut-être été falsifié — ne faites pas confiance à la réunion.',
} as const;

export default fr;
