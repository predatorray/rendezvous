const pt = {
  lang: 'Português',

  home_tagline: 'Onde as conversas se encontram, sem servidores.',
  home_description:
    'Crie uma sala de vídeo privada em segundos. WebRTC puro ponto a ponto — sem contas, sem servidores, sem intermediários. Só você, as suas pessoas e um código de seis letras.',
  home_your_name: 'Seu nome',
  home_host: 'Iniciar nova reunião',
  home_or_join: 'ou entrar',
  home_meeting_code: 'Código da reunião',
  home_meeting_code_placeholder: 'ABCXYZ',
  home_join: 'Entrar',
  home_name_required_hint: 'Digite seu nome para hospedar ou entrar.',
  home_error_name: 'Por favor, digite seu nome.',
  home_error_code: 'O código da reunião deve ter 6 letras.',
  home_footnote: 'Ponto a ponto via WebRTC. Sem contas, sem servidores.',

  footer_author: 'Autor',
  footer_github: 'GitHub',
  footer_feedback: 'Feedback',

  meeting_invalid_code: 'Código de reunião inválido',
  meeting_back_home: 'Voltar ao início',
  meeting_join_title: 'Entrar na reunião',
  meeting_enter_name: 'Por favor, digite seu nome para continuar.',
  meeting_your_name: 'Seu nome',
  meeting_join: 'Entrar',

  meeting_preparing: 'Preparando sua câmera e microfone…',
  meeting_starting: 'Iniciando a reunião…',
  meeting_joining: 'Entrando na reunião…',

  meeting_error_title: 'Não foi possível entrar na reunião',
  meeting_error_default: 'Ocorreu um erro.',
  meeting_error_unavailable_id:
    'Este código de reunião já está em uso. Tente outro.',
  meeting_error_peer_unavailable: 'Reunião não encontrada.',
  meeting_error_start: 'Falha ao iniciar a reunião.',

  meeting_ended_host: 'O anfitrião encerrou a reunião',
  meeting_ended_self: 'Você saiu da reunião',
  meeting_ended_kicked: 'Você foi removido da reunião pelo anfitrião',

  meeting_share_invite_aria: 'Compartilhar convite',
  meeting_person: 'pessoa',
  meeting_people: 'pessoas',

  meeting_end_for_everyone: 'Encerrar a reunião para todos?',
  meeting_leave_title: 'Sair da reunião?',
  meeting_end_for_everyone_body:
    'Você é o anfitrião. Encerrar a reunião desconectará todos.',
  meeting_leave_body: 'Você será desconectado desta reunião.',
  meeting_cancel: 'Cancelar',
  meeting_end: 'Encerrar reunião',
  meeting_leave: 'Sair',

  chat_title: 'Bate-papo',
  chat_close: 'Fechar bate-papo',
  chat_send: 'Enviar mensagem',
  chat_emoji: 'Inserir emoji',
  chat_placeholder: 'Mensagem…',
  chat_empty: 'Ainda não há mensagens.',
  chat_you: 'Você',
  chat_system_joined: (name: string) => `${name} entrou`,
  chat_system_left: (name: string) => `${name} saiu`,

  controls_mute: 'Silenciar',
  controls_unmute: 'Ativar som',
  controls_stop_video: 'Parar vídeo',
  controls_start_video: 'Iniciar vídeo',
  controls_chat: 'Bate-papo',
  controls_share: 'Compartilhar convite',
  controls_participants: 'Participantes',
  controls_leave: 'Sair',

  participants_title: 'Participantes',
  participants_close: 'Fechar participantes',
  participants_host: 'Anfitrião',
  participants_you: 'Você',
  participants_kick: 'Remover da reunião',
  participants_kick_confirm_title: 'Remover participante?',
  participants_kick_confirm_body: (name: string) =>
    `${name} será removido desta reunião.`,
  participants_kick_confirm: 'Remover',
  participants_system_kicked: (name: string) => `${name} foi removido`,

  rail_resize: 'Redimensionar painéis',

  share_title: 'Convidar outras pessoas',
  share_meeting_code: 'Código da reunião',
  share_copy_code: 'Copiar código',
  share_copy_link: 'Copiar link',
  share_copied: 'Copiado',
  share_invite_link: 'Link de convite',
  share_via: 'Compartilhar via',
  share_more: 'Mais…',
  share_more_aria: 'Mais opções de compartilhamento',
  share_done: 'Concluído',
  share_on: (network: string) => `Compartilhar no ${network}`,
  share_subject: 'Entre na minha reunião',
  share_text: (code: string) => `Entre na minha reunião (código: ${code})`,

  tile_you: '(você)',
  tile_host: 'Anfitrião',

  theme_switch_to: (mode: string) => `Mudar para o modo ${mode}`,
  theme_dark: 'escuro',
  theme_light: 'claro',

  language_change: 'Alterar idioma',
} as const;

export default pt;
