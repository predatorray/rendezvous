const es = {
  lang: 'Español',

  home_tagline: 'Donde las conversaciones se encuentran, sin servidores.',
  home_description:
    'Crea una sala de vídeo privada en segundos. WebRTC puro entre pares — sin cuentas, sin servidores, sin intermediarios. Solo tú, tu gente y un código de seis letras.',
  home_your_name: 'Tu nombre',
  home_host: 'Iniciar nueva reunión',
  home_or_join: 'o unirse',
  home_meeting_code: 'Código de reunión',
  home_meeting_code_placeholder: 'abcxyz',
  home_join: 'Unirse',
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
} as const;

export default es;
