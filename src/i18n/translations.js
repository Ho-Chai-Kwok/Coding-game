// UI chrome translations (navigation, buttons, static labels). Lesson
// content itself (tutorials, exercise instructions, hints, quiz text)
// stays in English for now — translating 260+ authored lessons is a
// separate, much larger effort than translating the app shell.

export const LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

export const translations = {
  en: {
    appName: "Code Quest",
    back: "Back",
    backToModes: "Modes",
    backToWorlds: "Worlds",
    backToAllQuests: "All Quests",

    modeSelect: {
      greeting: "Hi there! What kind of adventure sounds fun today?",
      welcomeBack: "Welcome back,",
      welcomeGuest: "Hi there,",
      dayStreak: "day streak",
      overallProgress: "lessons complete",
      continueLearning: "Continue Learning",
      continueButton: "Continue →",
      learningTitle: "Learning Mode",
      learningDesc: "100 worlds, one topic at a time — go slow, go steady!",
      sidequestTitle: "Side Quests",
      sidequestDesc: "10-lesson courses on real tools like PyTorch, AWS, and NumPy!",
      rankedTitle: "Ranked Mode",
      rankedDesc: "Take on quick challenges and climb the rank ladder!",
      charactersTitle: "Characters",
      charactersDesc: "Unlock characters through your progress and pick your favorite!",
    },

    languageSelect: {
      title: "Pick Your Language 💻",
      subtitle: "Which language do you want to code in?",
      jsDesc: "The language of the web — runs instantly in your browser!",
      pyDesc: "Friendly and readable — a favorite for beginners!",
    },

    worldMap: {
      title: "Choose a World 🗺️",
      subtitle: "100 worlds, one topic each — learn slowly, one step at a time!",
      stages: "stages",
      change: "change",
      chapters: [
        "Foundations",
        "Core Skills",
        "Data & Structures",
        "Functions Deep Dive",
        "Web Basics",
        "Async & APIs",
        "Patterns & Practices",
        "Problem Solving",
        "Interview Prep",
        "Final Challenges",
      ],
      chapterLabel: "Chapter {n}",
      moreAdventures: "More Adventures",
    },

    levelMap: {
      stagesComplete: "stages complete",
      encourageStart: "You've got this — let's begin! 🚀",
      encourageDone: "World complete! You're amazing! 🏆",
      encourageHalf: "Halfway there — keep it up! 🌟",
      encourageProgress: "Great progress — keep going! 💪",
    },

    levelScreen: {
      rankedHint: "Demo controls — report how the match went:",
      won: "🎉 I Won",
      lost: "💔 I Lost",
      placeholder: [
        "Your guide is warming up its circuits...",
        "This lesson is still being coded (very meta, we know).",
        "Great choice! The exercises for this one are on their way.",
      ],
    },

    codeChallenge: {
      run: "▶ Run Code",
      running: "⏳ Running...",
      success: "🎉 Awesome job! Output:",
      continue: "Continue →",
      mismatch: "So close! Let's try again 💪",
      output: "Output:",
      nothingPrinted: "(nothing printed)",
      error: "Oops, a little hiccup! 🔧",
    },

    quizChallenge: {
      correct: "🎉 You got it!",
      incorrect: "🤔 Not quite — try again!",
      continue: "Continue →",
      tryAgain: "Try Again",
    },

    rankedHome: {
      pointsToNext: "LP to next division",
      maxTier: "You've reached the top rank!",
      wins: "Wins",
      losses: "Losses",
      winRate: "Win rate",
      play: "⚔️ Play Ranked Match",
      playingAs: "Playing as",
      changeCharacter: "Change →",
    },

    sideQuestMap: {
      title: "Side Quests 🧭",
      subtitle: "20 short courses on real tools —",
      lessonsComplete: "lessons complete!",
      lessons: "lessons",
      completed: "Completed",
      notStarted: "Not started",
    },

    sideQuestPath: {
      lessonsComplete: "lessons complete",
    },

    tutorialCard: {
      label: "📘 Quick Lesson",
    },

    auth: {
      welcome: "Welcome to Code Quest",
      subtitle: "Log in to save your progress across devices, or jump in as a guest.",
      email: "Email",
      password: "Password",
      displayName: "Display name",
      logIn: "Log In",
      signUp: "Sign Up",
      continueAsGuest: "Continue as Guest →",
      needAccount: "Need an account? Sign up",
      haveAccount: "Already have an account? Log in",
      signOut: "Sign Out",
      loggedInAs: "Logged in as",
      guestMode: "Guest mode — progress saved on this device only",
      loading: "Loading...",
      genericError: "Something went wrong. Please try again.",
      backendNotConfigured:
        "Accounts aren't set up yet — continue as a guest for now.",
    },

    calendar: {
      title: "Daily Rewards",
      newReward: "🎉 You earned a new reward!",
      awesome: "Awesome!",
      rewardLadder: "Streak Reward Ladder",
      day: "Day",
      unlockAvatar: "Unlock avatar",
    },

    settings: {
      title: "Settings ⚙️",
      profile: "Profile",
      displayNameLabel: "Display Name",
      displayNamePlaceholder: "Your name",
      chooseAvatar: "Choose an avatar",
      appearance: "Appearance",
      themeSystem: "System",
      themeLight: "Light",
      themeDark: "Dark",
      codingLanguage: "Coding Language",
      language: "App Language",
      account: "Account",
      resetProgress: "Reset All Progress",
      resetConfirm: "This will erase all your progress on this device. Are you sure?",
      about: "About",
      madeWith: "Made with 💜 for young coders everywhere.",
    },

    characters: {
      title: "Characters",
      subtitle: "Unlock characters by playing, and pick one to represent you in Ranked Mode!",
      unlockedCount: "unlocked",
      select: "Select",
      selected: "Selected",
      unlockCompleted: "Complete {n} lessons to unlock",
      unlockRankedWins: "Win {n} ranked matches to unlock",
      unlockRankedMatches: "Play {n} ranked matches to unlock",
      unlockRankedPoints: "Reach {n} ranked points to unlock",
      unlockStreak: "Reach a {n}-day streak to unlock",
      unlockDefault: "Keep playing to unlock",
    },
  },

  es: {
    appName: "Code Quest",
    back: "Atrás",
    backToModes: "Modos",
    backToWorlds: "Mundos",
    backToAllQuests: "Todas las Misiones",

    modeSelect: {
      greeting: "¡Hola! ¿Qué aventura te apetece hoy?",
      welcomeBack: "Bienvenido de nuevo,",
      welcomeGuest: "Hola,",
      dayStreak: "días seguidos",
      overallProgress: "lecciones completadas",
      continueLearning: "Continuar Aprendiendo",
      continueButton: "Continuar →",
      learningTitle: "Modo Aprendizaje",
      learningDesc: "100 mundos, un tema a la vez — ¡con calma, paso a paso!",
      sidequestTitle: "Misiones Secundarias",
      sidequestDesc: "Cursos de 10 lecciones sobre herramientas reales como PyTorch, AWS y NumPy!",
      rankedTitle: "Modo Clasificado",
      rankedDesc: "¡Enfréntate a retos rápidos y sube en la clasificación!",
      charactersTitle: "Personajes",
      charactersDesc: "¡Desbloquea personajes con tu progreso y elige tu favorito!",
    },

    languageSelect: {
      title: "Elige tu Lenguaje 💻",
      subtitle: "¿En qué lenguaje quieres programar?",
      jsDesc: "El lenguaje de la web — ¡se ejecuta al instante en tu navegador!",
      pyDesc: "Amigable y fácil de leer — ¡uno de los favoritos para principiantes!",
    },

    worldMap: {
      title: "Elige un Mundo 🗺️",
      subtitle: "100 mundos, un tema cada uno — ¡aprende despacio, paso a paso!",
      stages: "etapas",
      change: "cambiar",
      chapters: [
        "Fundamentos",
        "Habilidades Básicas",
        "Datos y Estructuras",
        "Funciones a Fondo",
        "Fundamentos Web",
        "Async y APIs",
        "Patrones y Prácticas",
        "Resolución de Problemas",
        "Preparación de Entrevistas",
        "Retos Finales",
      ],
      chapterLabel: "Capítulo {n}",
      moreAdventures: "Más Aventuras",
    },

    levelMap: {
      stagesComplete: "etapas completadas",
      encourageStart: "¡Tú puedes — empecemos! 🚀",
      encourageDone: "¡Mundo completado! ¡Eres increíble! 🏆",
      encourageHalf: "¡Vas a la mitad — sigue así! 🌟",
      encourageProgress: "¡Gran progreso — sigue adelante! 💪",
    },

    levelScreen: {
      rankedHint: "Controles de demostración — indica cómo fue la partida:",
      won: "🎉 Gané",
      lost: "💔 Perdí",
      placeholder: [
        "Tu guía está calentando sus circuitos...",
        "Esta lección todavía se está programando (muy irónico, lo sabemos).",
        "¡Buena elección! Los ejercicios de esto están en camino.",
      ],
    },

    codeChallenge: {
      run: "▶ Ejecutar Código",
      running: "⏳ Ejecutando...",
      success: "🎉 ¡Excelente trabajo! Salida:",
      continue: "Continuar →",
      mismatch: "¡Casi! Vamos a intentarlo de nuevo 💪",
      output: "Salida:",
      nothingPrinted: "(no se imprimió nada)",
      error: "¡Ups, un pequeño problema! 🔧",
    },

    quizChallenge: {
      correct: "🎉 ¡Lo lograste!",
      incorrect: "🤔 No es correcto — ¡inténtalo de nuevo!",
      continue: "Continuar →",
      tryAgain: "Intentar de Nuevo",
    },

    rankedHome: {
      pointsToNext: "PL para la siguiente división",
      maxTier: "¡Has alcanzado el rango máximo!",
      wins: "Victorias",
      losses: "Derrotas",
      winRate: "Tasa de victorias",
      play: "⚔️ Jugar Partida Clasificada",
      playingAs: "Jugando como",
      changeCharacter: "Cambiar →",
    },

    sideQuestMap: {
      title: "Misiones Secundarias 🧭",
      subtitle: "20 cursos cortos sobre herramientas reales —",
      lessonsComplete: "lecciones completadas!",
      lessons: "lecciones",
      completed: "Completado",
      notStarted: "Sin empezar",
    },

    sideQuestPath: {
      lessonsComplete: "lecciones completadas",
    },

    tutorialCard: {
      label: "📘 Lección Rápida",
    },

    auth: {
      welcome: "Bienvenido a Code Quest",
      subtitle: "Inicia sesión para guardar tu progreso en todos tus dispositivos, o entra como invitado.",
      email: "Correo electrónico",
      password: "Contraseña",
      displayName: "Nombre para mostrar",
      logIn: "Iniciar Sesión",
      signUp: "Registrarse",
      continueAsGuest: "Continuar como Invitado →",
      needAccount: "¿No tienes cuenta? Regístrate",
      haveAccount: "¿Ya tienes cuenta? Inicia sesión",
      signOut: "Cerrar Sesión",
      loggedInAs: "Sesión iniciada como",
      guestMode: "Modo invitado — progreso guardado solo en este dispositivo",
      loading: "Cargando...",
      genericError: "Algo salió mal. Inténtalo de nuevo.",
      backendNotConfigured:
        "Las cuentas aún no están configuradas — continúa como invitado por ahora.",
    },

    calendar: {
      title: "Recompensas Diarias",
      newReward: "🎉 ¡Ganaste una nueva recompensa!",
      awesome: "¡Genial!",
      rewardLadder: "Escalera de Recompensas",
      day: "Día",
      unlockAvatar: "Desbloquea avatar",
    },

    settings: {
      title: "Configuración ⚙️",
      profile: "Perfil",
      displayNameLabel: "Nombre para Mostrar",
      displayNamePlaceholder: "Tu nombre",
      chooseAvatar: "Elige un avatar",
      appearance: "Apariencia",
      themeSystem: "Sistema",
      themeLight: "Claro",
      themeDark: "Oscuro",
      codingLanguage: "Lenguaje de Programación",
      language: "Idioma de la App",
      account: "Cuenta",
      resetProgress: "Reiniciar Todo el Progreso",
      resetConfirm: "Esto borrará todo tu progreso en este dispositivo. ¿Estás seguro?",
      about: "Acerca de",
      madeWith: "Hecho con 💜 para jóvenes programadores de todo el mundo.",
    },

    characters: {
      title: "Personajes",
      subtitle: "¡Desbloquea personajes jugando y elige uno para representarte en el Modo Clasificado!",
      unlockedCount: "desbloqueados",
      select: "Elegir",
      selected: "Elegido",
      unlockCompleted: "Completa {n} lecciones para desbloquear",
      unlockRankedWins: "Gana {n} partidas clasificadas para desbloquear",
      unlockRankedMatches: "Juega {n} partidas clasificadas para desbloquear",
      unlockRankedPoints: "Alcanza {n} puntos clasificados para desbloquear",
      unlockStreak: "Alcanza una racha de {n} días para desbloquear",
      unlockDefault: "Sigue jugando para desbloquear",
    },
  },

  "zh-TW": {
    appName: "Code Quest",
    back: "返回",
    backToModes: "模式",
    backToWorlds: "世界",
    backToAllQuests: "所有支線任務",

    modeSelect: {
      greeting: "嗨！今天想來場什麼樣的冒險呢？",
      welcomeBack: "歡迎回來，",
      welcomeGuest: "嗨，",
      dayStreak: "天連續學習",
      overallProgress: "堂課已完成",
      continueLearning: "繼續學習",
      continueButton: "繼續 →",
      learningTitle: "學習模式",
      learningDesc: "100 個世界，一次專注一個主題——慢慢來，穩紮穩打！",
      sidequestTitle: "支線任務",
      sidequestDesc: "10 堂課程，帶你認識 PyTorch、AWS、NumPy 等真實工具！",
      rankedTitle: "排名模式",
      rankedDesc: "接受快速挑戰，攀登排名階梯！",
      charactersTitle: "角色",
      charactersDesc: "透過進度解鎖角色，選出你最喜歡的一個！",
    },

    languageSelect: {
      title: "選擇你的程式語言 💻",
      subtitle: "你想用哪種語言寫程式？",
      jsDesc: "網頁的語言——在瀏覽器中立即執行！",
      pyDesc: "親切易讀——初學者的最愛！",
    },

    worldMap: {
      title: "選擇一個世界 🗺️",
      subtitle: "100 個世界，每個都有專屬主題——慢慢學，一步一步來！",
      stages: "關卡",
      change: "更換",
      chapters: [
        "基礎入門",
        "核心技能",
        "資料與結構",
        "函式深入探討",
        "網頁基礎",
        "非同步與 API",
        "設計模式與實務",
        "解決問題",
        "面試準備",
        "最終挑戰",
      ],
      chapterLabel: "第 {n} 章",
      moreAdventures: "更多冒險",
    },

    levelMap: {
      stagesComplete: "關卡已完成",
      encourageStart: "你可以的——我們開始吧！🚀",
      encourageDone: "世界完成！你太棒了！🏆",
      encourageHalf: "已經過半——繼續保持！🌟",
      encourageProgress: "進步很多——繼續加油！💪",
    },

    levelScreen: {
      rankedHint: "示範控制項——回報這場比賽的結果：",
      won: "🎉 我贏了",
      lost: "💔 我輸了",
      placeholder: [
        "你的導師正在熱機...",
        "這堂課還在製作中（真的很有梗，我們知道）。",
        "選得好！這堂課的練習題即將推出。",
      ],
    },

    codeChallenge: {
      run: "▶ 執行程式碼",
      running: "⏳ 執行中...",
      success: "🎉 太棒了！輸出：",
      continue: "繼續 →",
      mismatch: "就差一點！再試一次吧 💪",
      output: "輸出：",
      nothingPrinted: "（沒有印出任何內容）",
      error: "哎呀，出了個小狀況！🔧",
    },

    quizChallenge: {
      correct: "🎉 答對了！",
      incorrect: "🤔 不太對——再試一次！",
      continue: "繼續 →",
      tryAgain: "再試一次",
    },

    rankedHome: {
      pointsToNext: "LP 即可晉級",
      maxTier: "你已達到最高段位！",
      wins: "勝場",
      losses: "敗場",
      winRate: "勝率",
      play: "⚔️ 開始排名對戰",
      playingAs: "目前使用角色",
      changeCharacter: "更換 →",
    },

    sideQuestMap: {
      title: "支線任務 🧭",
      subtitle: "20 個關於真實工具的短課程 —",
      lessonsComplete: "堂課已完成！",
      lessons: "堂課",
      completed: "已完成",
      notStarted: "尚未開始",
    },

    sideQuestPath: {
      lessonsComplete: "堂課已完成",
    },

    tutorialCard: {
      label: "📘 快速課程",
    },

    auth: {
      welcome: "歡迎來到 Code Quest",
      subtitle: "登入以在各裝置間同步你的進度，或以訪客身分直接開始。",
      email: "電子郵件",
      password: "密碼",
      displayName: "顯示名稱",
      logIn: "登入",
      signUp: "註冊",
      continueAsGuest: "以訪客身分繼續 →",
      needAccount: "還沒有帳號？註冊",
      haveAccount: "已經有帳號了？登入",
      signOut: "登出",
      loggedInAs: "登入身分：",
      guestMode: "訪客模式——進度僅儲存在此裝置",
      loading: "載入中...",
      genericError: "發生錯誤，請再試一次。",
      backendNotConfigured: "帳號功能尚未設定完成——請先以訪客身分繼續。",
    },

    calendar: {
      title: "每日獎勵",
      newReward: "🎉 你獲得了新獎勵！",
      awesome: "太棒了！",
      rewardLadder: "連續登入獎勵階梯",
      day: "第",
      unlockAvatar: "解鎖頭像",
    },

    settings: {
      title: "設定 ⚙️",
      profile: "個人檔案",
      displayNameLabel: "顯示名稱",
      displayNamePlaceholder: "你的名字",
      chooseAvatar: "選擇一個頭像",
      appearance: "外觀",
      themeSystem: "系統預設",
      themeLight: "淺色",
      themeDark: "深色",
      codingLanguage: "程式語言",
      language: "應用程式語言",
      account: "帳號",
      resetProgress: "重置所有進度",
      resetConfirm: "這將清除你在此裝置上的所有進度，確定要繼續嗎？",
      about: "關於",
      madeWith: "用 💜 為全世界的小小程式設計師打造。",
    },

    characters: {
      title: "角色",
      subtitle: "透過遊玩解鎖角色，選一個代表你參加排名模式！",
      unlockedCount: "已解鎖",
      select: "選擇",
      selected: "已選擇",
      unlockCompleted: "完成 {n} 堂課即可解鎖",
      unlockRankedWins: "贏得 {n} 場排名對戰即可解鎖",
      unlockRankedMatches: "遊玩 {n} 場排名對戰即可解鎖",
      unlockRankedPoints: "達到 {n} 排名點數即可解鎖",
      unlockStreak: "達到連續 {n} 天登入即可解鎖",
      unlockDefault: "繼續遊玩即可解鎖",
    },
  },

  ko: {
    appName: "Code Quest",
    back: "뒤로",
    backToModes: "모드",
    backToWorlds: "월드",
    backToAllQuests: "모든 퀘스트",

    modeSelect: {
      greeting: "안녕하세요! 오늘은 어떤 모험을 해볼까요?",
      welcomeBack: "다시 오셨네요,",
      welcomeGuest: "안녕하세요,",
      dayStreak: "일 연속 학습",
      overallProgress: "레슨 완료",
      continueLearning: "이어서 학습하기",
      continueButton: "계속하기 →",
      learningTitle: "학습 모드",
      learningDesc: "100개의 월드, 한 번에 한 주제씩 — 천천히, 꾸준하게!",
      sidequestTitle: "사이드 퀘스트",
      sidequestDesc: "PyTorch, AWS, NumPy 같은 실전 도구를 배우는 10강 코스!",
      rankedTitle: "랭크 모드",
      rankedDesc: "빠른 챌린지에 도전하고 랭크 사다리를 올라가 보세요!",
      charactersTitle: "캐릭터",
      charactersDesc: "진행 상황에 따라 캐릭터를 잠금 해제하고 좋아하는 캐릭터를 골라보세요!",
    },

    languageSelect: {
      title: "언어를 선택하세요 💻",
      subtitle: "어떤 언어로 코딩하고 싶나요?",
      jsDesc: "웹의 언어 — 브라우저에서 바로 실행돼요!",
      pyDesc: "친근하고 읽기 쉬운 — 초보자에게 인기 만점!",
    },

    worldMap: {
      title: "월드를 선택하세요 🗺️",
      subtitle: "100개의 월드, 각각 하나의 주제 — 천천히 한 걸음씩 배워요!",
      stages: "스테이지",
      change: "변경",
      chapters: [
        "기초 다지기",
        "핵심 스킬",
        "데이터와 구조",
        "함수 심화",
        "웹 기초",
        "비동기와 API",
        "패턴과 실전",
        "문제 해결",
        "면접 준비",
        "최종 챌린지",
      ],
      chapterLabel: "챕터 {n}",
      moreAdventures: "더 많은 모험",
    },

    levelMap: {
      stagesComplete: "스테이지 완료",
      encourageStart: "할 수 있어요 — 시작해 볼까요! 🚀",
      encourageDone: "월드 완료! 정말 대단해요! 🏆",
      encourageHalf: "절반 왔어요 — 계속해봐요! 🌟",
      encourageProgress: "잘하고 있어요 — 계속 가봐요! 💪",
    },

    levelScreen: {
      rankedHint: "데모 컨트롤 — 경기 결과를 알려주세요:",
      won: "🎉 이겼어요",
      lost: "💔 졌어요",
      placeholder: [
        "가이드가 시동을 걸고 있어요...",
        "이 레슨은 아직 만드는 중이에요 (정말 딱 맞는 상황이죠).",
        "좋은 선택이에요! 이 레슨의 연습문제가 곧 준비될 거예요.",
      ],
    },

    codeChallenge: {
      run: "▶ 코드 실행",
      running: "⏳ 실행 중...",
      success: "🎉 정말 잘했어요! 출력:",
      continue: "계속하기 →",
      mismatch: "거의 다 왔어요! 다시 시도해봐요 💪",
      output: "출력:",
      nothingPrinted: "(아무것도 출력되지 않았어요)",
      error: "앗, 작은 문제가 생겼어요! 🔧",
    },

    quizChallenge: {
      correct: "🎉 정답이에요!",
      incorrect: "🤔 아쉬워요 — 다시 시도해봐요!",
      continue: "계속하기 →",
      tryAgain: "다시 시도",
    },

    rankedHome: {
      pointsToNext: "다음 등급까지 LP",
      maxTier: "최고 등급에 도달했어요!",
      wins: "승",
      losses: "패",
      winRate: "승률",
      play: "⚔️ 랭크 경기 시작",
      playingAs: "현재 캐릭터",
      changeCharacter: "변경 →",
    },

    sideQuestMap: {
      title: "사이드 퀘스트 🧭",
      subtitle: "실전 도구를 다루는 20개의 짧은 코스 —",
      lessonsComplete: "레슨 완료!",
      lessons: "레슨",
      completed: "완료됨",
      notStarted: "시작 전",
    },

    sideQuestPath: {
      lessonsComplete: "레슨 완료",
    },

    tutorialCard: {
      label: "📘 짧은 레슨",
    },

    auth: {
      welcome: "Code Quest에 오신 것을 환영해요",
      subtitle: "로그인하면 여러 기기에서 진행 상황을 저장할 수 있어요. 아니면 게스트로 바로 시작하세요.",
      email: "이메일",
      password: "비밀번호",
      displayName: "표시 이름",
      logIn: "로그인",
      signUp: "회원가입",
      continueAsGuest: "게스트로 계속하기 →",
      needAccount: "계정이 없으신가요? 회원가입",
      haveAccount: "이미 계정이 있으신가요? 로그인",
      signOut: "로그아웃",
      loggedInAs: "로그인 계정:",
      guestMode: "게스트 모드 — 진행 상황은 이 기기에만 저장돼요",
      loading: "불러오는 중...",
      genericError: "문제가 발생했어요. 다시 시도해주세요.",
      backendNotConfigured: "계정 기능이 아직 설정되지 않았어요 — 지금은 게스트로 계속해주세요.",
    },

    calendar: {
      title: "출석 보상",
      newReward: "🎉 새로운 보상을 받았어요!",
      awesome: "좋아요!",
      rewardLadder: "연속 출석 보상",
      day: "Day",
      unlockAvatar: "아바타 잠금 해제",
    },

    settings: {
      title: "설정 ⚙️",
      profile: "프로필",
      displayNameLabel: "표시 이름",
      displayNamePlaceholder: "이름을 입력하세요",
      chooseAvatar: "아바타 선택",
      appearance: "화면 모드",
      themeSystem: "시스템 설정",
      themeLight: "라이트 모드",
      themeDark: "다크 모드",
      codingLanguage: "프로그래밍 언어",
      language: "앱 언어",
      account: "계정",
      resetProgress: "모든 진행 상황 초기화",
      resetConfirm: "이 기기의 모든 진행 상황이 삭제돼요. 계속할까요?",
      about: "앱 정보",
      madeWith: "전 세계 어린이 코더들을 위해 💜 를 담아 만들었어요.",
    },

    characters: {
      title: "캐릭터",
      subtitle: "플레이해서 캐릭터를 잠금 해제하고, 랭크 모드에서 나를 대표할 캐릭터를 골라보세요!",
      unlockedCount: "잠금 해제됨",
      select: "선택",
      selected: "선택됨",
      unlockCompleted: "레슨 {n}개를 완료하면 잠금 해제",
      unlockRankedWins: "랭크 경기 {n}승을 하면 잠금 해제",
      unlockRankedMatches: "랭크 경기 {n}회를 플레이하면 잠금 해제",
      unlockRankedPoints: "랭크 포인트 {n}점에 도달하면 잠금 해제",
      unlockStreak: "{n}일 연속 학습을 달성하면 잠금 해제",
      unlockDefault: "계속 플레이하면 잠금 해제돼요",
    },
  },
};

export function getTranslation(locale, key) {
  const path = key.split(".");
  let node = translations[locale] ?? translations.en;
  for (const segment of path) {
    node = node?.[segment];
  }
  if (node === undefined) {
    // Fall back to English if a key is missing in the target locale.
    node = translations.en;
    for (const segment of path) {
      node = node?.[segment];
    }
  }
  return node ?? key;
}
