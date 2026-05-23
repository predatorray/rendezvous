const es = {
  lang: 'Español',

  home_tagline: 'Donde las conversaciones se encuentran, sin servidores.',
  home_description:
    'Crea una sala de vídeo privada en segundos. WebRTC puro entre pares — sin cuentas, sin servidores, sin intermediarios. Solo tú, tu gente y un código de seis letras.',
  home_your_name: 'Tu nombre',
  home_host: 'Iniciar nueva reunión',
  home_or_join: 'o unirse',
  home_meeting_code: 'Código de reunión',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: 'Unirse',
  home_name_required_hint: 'Introduce tu nombre para crear o unirte.',
  home_error_name: 'Por favor, introduce tu nombre.',
  home_error_code: 'El código de reunión debe tener 6 letras.',
  home_footnote: 'Entre pares mediante WebRTC. Sin cuentas, sin servidores.',

  footer_author: 'Autor',
  footer_github: 'GitHub',
  footer_feedback: 'Comentarios',

  meeting_invalid_code: 'Código de reunión no válido',
  meeting_back_home: 'Volver al inicio',
  meeting_join_title: 'Unirse a la reunión',
  meeting_enter_name: 'Por favor, introduce tu nombre para continuar.',
  meeting_your_name: 'Tu nombre',
  meeting_join: 'Unirse',

  meeting_preparing: 'Preparando tu cámara y micrófono…',
  meeting_starting: 'Iniciando reunión…',
  meeting_joining: 'Uniéndose a la reunión…',

  meeting_error_title: 'No se pudo unir a la reunión',
  meeting_error_default: 'Se ha producido un error.',
  meeting_error_unavailable_id:
    'Este código de reunión ya está en uso. Prueba con otro.',
  meeting_error_peer_unavailable: 'Reunión no encontrada.',
  meeting_error_start: 'Error al iniciar la reunión.',

  meeting_ended_host: 'El anfitrión finalizó la reunión',
  meeting_ended_self: 'Has salido de la reunión',
  meeting_ended_kicked: 'El anfitrión te ha expulsado de la reunión',

  meeting_share_invite_aria: 'Compartir invitación',
  meeting_person: 'persona',
  meeting_people: 'personas',

  meeting_end_for_everyone: '¿Finalizar la reunión para todos?',
  meeting_leave_title: '¿Salir de la reunión?',
  meeting_end_for_everyone_body:
    'Eres el anfitrión. Finalizar la reunión desconectará a todos.',
  meeting_leave_body: 'Serás desconectado de esta reunión.',
  meeting_cancel: 'Cancelar',
  meeting_end: 'Finalizar reunión',
  meeting_leave: 'Salir',

  chat_title: 'Chat',
  chat_close: 'Cerrar chat',
  chat_send: 'Enviar mensaje',
  chat_emoji: 'Insertar emoji',
  chat_placeholder: 'Mensaje…',
  chat_empty: 'Aún no hay mensajes.',
  chat_you: 'Tú',
  chat_system_joined: (name: string) => `${name} se ha unido`,
  chat_system_left: (name: string) => `${name} ha salido`,

  controls_mute: 'Silenciar',
  controls_unmute: 'Activar micrófono',
  controls_stop_video: 'Detener vídeo',
  controls_start_video: 'Iniciar vídeo',
  controls_chat: 'Chat',
  controls_share: 'Compartir invitación',
  controls_participants: 'Participantes',
  controls_leave: 'Salir',

  participants_title: 'Participantes',
  participants_close: 'Cerrar participantes',
  participants_host: 'Anfitrión',
  participants_you: 'Tú',
  participants_kick: 'Expulsar de la reunión',
  participants_kick_confirm_title: '¿Expulsar al participante?',
  participants_kick_confirm_body: (name: string) =>
    `${name} será expulsado de esta reunión.`,
  participants_kick_confirm: 'Expulsar',
  participants_system_kicked: (name: string) => `${name} fue expulsado`,

  rail_resize: 'Cambiar tamaño de los paneles',

  share_title: 'Invitar a otros',
  share_meeting_code: 'Código de reunión',
  share_copy_code: 'Copiar código',
  share_copy_link: 'Copiar enlace',
  share_copied: 'Copiado',
  share_invite_link: 'Enlace de invitación',
  share_via: 'Compartir vía',
  share_more: 'Más…',
  share_more_aria: 'Más opciones para compartir',
  share_done: 'Hecho',
  share_on: (network: string) => `Compartir en ${network}`,
  share_subject: 'Únete a mi reunión',
  share_text: (code: string) => `Únete a mi reunión (código: ${code})`,

  tile_you: '(tú)',
  tile_host: 'Anfitrión',

  theme_switch_to: (mode: string) => `Cambiar al modo ${mode}`,
  theme_dark: 'oscuro',
  theme_light: 'claro',

  language_change: 'Cambiar idioma',

  // Reunión verificada (experimental)
  verify_toggle_label: 'Reunión verificada',
  verify_experimental_tag: 'Experimental',
  verify_toggle_hint:
    'Los invitados verifican criptográficamente que de verdad eres tú quien organiza, mediante una llave de acceso.',
  verify_unsupported: 'Este navegador no admite llaves de acceso.',
  verify_host_button: 'Organizar reunión verificada',
  verify_create_failed: 'No se pudo crear tu identidad con llave de acceso.',

  verify_host_unlock_title: 'Desbloquear para organizar',
  verify_host_unlock_body:
    'Confirma con tu llave de acceso para que los invitados puedan verificar que esta reunión la organizas tú.',
  verify_host_unlock_cta: 'Verificar con llave de acceso',
  verify_host_unlocking: 'Esperando la llave de acceso…',
  verify_host_unlock_failed: 'Falló la verificación con llave de acceso.',

  verify_waiting_title: 'Esperando al anfitrión',
  verify_waiting_body:
    'Esta reunión aún no ha empezado. Te unirás automáticamente cuando llegue el anfitrión.',
  verify_waiting_host_question: '¿Eres el anfitrión?',
  verify_waiting_host_cta: 'Organizar esta reunión',
  verify_checking: 'Verificando la identidad del anfitrión…',

  verify_badge_host: 'Anfitrión verificado',
  verify_badge_verified: 'Verificado',
  verify_badge_pending: 'Verificando…',

  verify_error_timeout:
    'El anfitrión no respondió a la verificación de identidad.',
  verify_error_unavailable:
    'No se pudo verificar esta reunión. El anfitrión no usa verificación, o alguien podría estar suplantándolo.',
  verify_error_failed:
    'No se pudo verificar la identidad del anfitrión. No compartas nada sensible: puede que no estés hablando con el anfitrión real.',

  share_fingerprint_label: 'Huella del anfitrión',
  share_copy_fingerprint: 'Copiar huella',
  share_fingerprint_hint:
    'Comparte esta huella por otro canal (en persona, por llamada). Los invitados pueden compararla para descartar a un impostor.',

  verify_identity_view: 'Ver identidad del anfitrión',
  verify_identity_title: 'Identidad del anfitrión',
  verify_identity_body_host:
    'Esta es la huella de tu reunión. Los invitados a quienes se la diste pueden confirmar que te localizaron a ti.',
  verify_identity_status_verified:
    'La identidad de este anfitrión se ha verificado criptográficamente.',
  verify_identity_status_pending: 'Verificando la identidad del anfitrión…',
  verify_identity_compare_hint:
    'Compárala con la huella que el anfitrión te dio por separado (en persona, por llamada, en un mensaje firmado). Si no coinciden, el enlace pudo haber sido manipulado: no confíes en la reunión.',
} as const;

export default es;
