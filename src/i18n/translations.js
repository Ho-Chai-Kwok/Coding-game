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

    rankedModes: {
      selectTitle: "Choose Your Mode 🎮",
      selectSubtitle: "Two arena favorites, plus modes that rotate daily — just like the pros!",
      rotationBadge: "🔄 Today Only",
      comingSoonBadge: "🚧 Coming Soon",
      archetypeBonus: "Bonus for:",
      round: "Round",
      roundsCompleted: "Rounds Completed",
      timeLeft: "Time Left",
      score: "Score",
      nextRound: "Next Round →",
      finish: "Finish →",
      continue: "Continue →",
      backToLobby: "← Back to Ranked",

      codeRace: {
        name: "Code Race",
        desc: "Solve coding puzzles back to back before the clock runs out.",
        winTitle: "🏁 You Finished the Race!",
        loseTitle: "⏱️ Time Ran Out",
        dashBonus: "Dash's speed bonus added extra seconds to your clock!",
      },

      bugHunt: {
        name: "Bug Hunt",
        desc: "Spot the buggy line, then pick the fix — before time's up.",
        winTitle: "🐞 Bug Hunt Complete!",
        loseTitle: "🔍 Better Luck Next Hunt",
        debuggerBonus: "Your Debugger's sharp eyes boosted your score!",
        findPrompt: "Tap the line with the bug:",
        fixPrompt: "Now pick the fix:",
      },

      predictOutput: {
        name: "Predict the Output",
        desc: "Read the code, guess what it prints — fast rounds, no mercy.",
        winTitle: "🔮 Nailed It!",
        loseTitle: "💭 So Close!",
        scopeBonus: "Scope revealed a wrong answer before you chose!",
      },

      codeGolf: {
        name: "Code Golf",
        desc: "Same puzzle for everyone — shortest working solution wins.",
        winTitle: "⛳ Solved!",
        loseTitle: "⏱️ Out of Time",
        yourLines: "Your Lines",
        par: "Par",
        lines: "lines",
        trimBonus: "Trim's refactoring bonus shaved extra points onto your score!",
      },

      showdown: {
        name: "Showdown",
        desc: "Survive as long as you can — one wrong answer and you're out.",
        winTitle: "🥇 Showdown Champion!",
        loseTitle: "💥 Eliminated",
        roundsSurvived: "Rounds Survived",
        nullPointerSave: "Null Pointer's streak protection saved your run!",
        getReady: "Get ready...",
      },

      debugDuel: {
        name: "Debug Duel",
        desc: "Race a ghost time to find and fix the bug first.",
        winTitle: "⚔️ Duel Won!",
        loseTitle: "💀 Duel Lost",
        yourTime: "Your Time",
        ghostTime: "Ghost Time",
        beatGhost: "You beat the ghost's time!",
        tankBonus: "Bastion's toughness gave you an extra life!",
      },

      chaosRound: {
        name: "Chaos Round",
        desc: "A familiar puzzle with a random twist. Anything can happen!",
        winTitle: "🌀 Chaos Tamed!",
        loseTitle: "💫 Chaos Wins This Time",
        modifier: "Modifier",
        glitchBonus: "Glitch turned your loss into a lucky wash!",
        modifiers: {
          doublePoints: { name: "Double Points", desc: "Win this round for double the ranked points." },
          halfTime: { name: "Half Time", desc: "The clock is cut in half — think fast!" },
          oneShot: { name: "One Shot", desc: "No retries. One answer, make it count." },
          noHints: { name: "No Hints", desc: "The tutorial and explanation are hidden this round." },
        },
      },

      relay: {
        name: "Relay",
        desc: "A 2-4 player team relay — coming once team matchmaking is ready.",
        comingSoon: "Relay needs real teammates to race with, so it's still in the workshop. Check back soon!",
      },

      shuffle: {
        title: "Shuffling...",
        spinning: "Spinning the wheel...",
        landed: "You got:",
        reshuffle: "Reshuffle",
        go: "Let's Go! →",
      },
    },

    sideQuestMap: {
      title: "Side Quests 🧭",
      subtitle: "28 short courses on real tools —",
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
      privacyNote: "🔒 We'll store your email & progress securely — no ads, ever. Under 13? Ask a parent first!",
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
      privacyNote: "Guest mode keeps everything on this device. Making an account stores your email and progress securely — no ads, no data selling. Under 13? Ask a parent first!",
      syncGuest: "Progress saved on this device only. Log in to keep it safe in the cloud.",
      syncSaving: "Saving to the cloud…",
      syncSaved: "Progress saved to your account ☁️",
      syncError: "Couldn't reach the cloud — progress is safe on this device and will sync when you're back online.",
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

    rankedModes: {
      selectTitle: "Elige tu Modo 🎮",
      selectSubtitle: "Dos favoritos del arena, más modos que rotan cada día — ¡como los profesionales!",
      rotationBadge: "🔄 Solo Hoy",
      comingSoonBadge: "🚧 Próximamente",
      archetypeBonus: "Bono para:",
      round: "Ronda",
      roundsCompleted: "Rondas Completadas",
      timeLeft: "Tiempo Restante",
      score: "Puntuación",
      nextRound: "Siguiente Ronda →",
      finish: "Terminar →",
      continue: "Continuar →",
      backToLobby: "← Volver a Clasificado",

      codeRace: {
        name: "Carrera de Código",
        desc: "Resuelve acertijos de código uno tras otro antes de que se acabe el tiempo.",
        winTitle: "🏁 ¡Terminaste la Carrera!",
        loseTitle: "⏱️ Se Acabó el Tiempo",
        dashBonus: "¡El bono de velocidad de Dash añadió segundos extra a tu reloj!",
      },

      bugHunt: {
        name: "Caza de Bichos",
        desc: "Encuentra la línea con el error y elige la solución — antes de que se acabe el tiempo.",
        winTitle: "🐞 ¡Caza Completa!",
        loseTitle: "🔍 Mejor Suerte la Próxima",
        debuggerBonus: "¡Los ojos agudos de tu Debugger aumentaron tu puntuación!",
        findPrompt: "Toca la línea con el error:",
        fixPrompt: "Ahora elige la solución:",
      },

      predictOutput: {
        name: "Predice la Salida",
        desc: "Lee el código, adivina qué imprime — rondas rápidas, sin piedad.",
        winTitle: "🔮 ¡Lo Lograste!",
        loseTitle: "💭 ¡Tan Cerca!",
        scopeBonus: "¡Scope reveló una respuesta incorrecta antes de elegir!",
      },

      codeGolf: {
        name: "Golf de Código",
        desc: "El mismo acertijo para todos — gana la solución más corta que funcione.",
        winTitle: "⛳ ¡Resuelto!",
        loseTitle: "⏱️ Sin Tiempo",
        yourLines: "Tus Líneas",
        par: "Par",
        lines: "líneas",
        trimBonus: "¡El bono de refactorización de Trim añadió puntos extra a tu puntuación!",
      },

      showdown: {
        name: "Enfrentamiento",
        desc: "Sobrevive todo lo que puedas — una respuesta incorrecta y estás fuera.",
        winTitle: "🥇 ¡Campeón del Enfrentamiento!",
        loseTitle: "💥 Eliminado",
        roundsSurvived: "Rondas Sobrevividas",
        nullPointerSave: "¡La protección de racha de Null Pointer salvó tu partida!",
        getReady: "Prepárate...",
      },

      debugDuel: {
        name: "Duelo de Depuración",
        desc: "Compite contra un tiempo fantasma para encontrar y arreglar el error primero.",
        winTitle: "⚔️ ¡Duelo Ganado!",
        loseTitle: "💀 Duelo Perdido",
        yourTime: "Tu Tiempo",
        ghostTime: "Tiempo Fantasma",
        beatGhost: "¡Venciste el tiempo del fantasma!",
        tankBonus: "¡La resistencia de Bastion te dio una vida extra!",
      },

      chaosRound: {
        name: "Ronda del Caos",
        desc: "Un acertijo familiar con un giro aleatorio. ¡Todo puede pasar!",
        winTitle: "🌀 ¡Caos Domado!",
        loseTitle: "💫 El Caos Gana Esta Vez",
        modifier: "Modificador",
        glitchBonus: "¡Glitch convirtió tu derrota en un empate afortunado!",
        modifiers: {
          doublePoints: { name: "Puntos Dobles", desc: "Gana esta ronda por el doble de puntos clasificados." },
          halfTime: { name: "Medio Tiempo", desc: "¡El reloj se reduce a la mitad — piensa rápido!" },
          oneShot: { name: "Una Oportunidad", desc: "Sin reintentos. Una respuesta, que cuente." },
          noHints: { name: "Sin Pistas", desc: "El tutorial y la explicación están ocultos esta ronda." },
        },
      },

      relay: {
        name: "Relevos",
        desc: "Un relevo en equipo de 2 a 4 jugadores — llegará cuando el emparejamiento en equipo esté listo.",
        comingSoon: "Relevos necesita compañeros de equipo reales para competir, así que todavía está en construcción. ¡Vuelve pronto!",
      },

      shuffle: {
        title: "Barajando...",
        spinning: "Girando la ruleta...",
        landed: "Te tocó:",
        reshuffle: "Volver a Barajar",
        go: "¡Vamos! →",
      },
    },

    sideQuestMap: {
      title: "Misiones Secundarias 🧭",
      subtitle: "28 cursos cortos sobre herramientas reales —",
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
      privacyNote: "🔒 Guardaremos tu correo y progreso de forma segura — sin anuncios, nunca. ¿Tienes menos de 13 años? ¡Pregúntale primero a un adulto!",
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
      privacyNote: "El modo invitado guarda todo solo en este dispositivo. Crear una cuenta guarda tu correo y progreso de forma segura — sin anuncios ni venta de datos. ¿Tienes menos de 13 años? ¡Pregúntale primero a un adulto!",
      syncGuest: "Progreso guardado solo en este dispositivo. Inicia sesión para guardarlo en la nube.",
      syncSaving: "Guardando en la nube…",
      syncSaved: "Progreso guardado en tu cuenta ☁️",
      syncError: "No se pudo conectar con la nube — tu progreso está a salvo en este dispositivo y se sincronizará al volver a conectarte.",
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

    rankedModes: {
      selectTitle: "選擇你的模式 🎮",
      selectSubtitle: "兩個競技場常駐模式，加上每日輪替的模式 — 就像職業選手一樣！",
      rotationBadge: "🔄 僅限今日",
      comingSoonBadge: "🚧 即將推出",
      archetypeBonus: "加成對象：",
      round: "回合",
      roundsCompleted: "完成回合數",
      timeLeft: "剩餘時間",
      score: "分數",
      nextRound: "下一回合 →",
      finish: "完成 →",
      continue: "繼續 →",
      backToLobby: "← 返回排名模式",

      codeRace: {
        name: "程式碼競速",
        desc: "在時間耗盡前連續解出程式謎題。",
        winTitle: "🏁 完成競速！",
        loseTitle: "⏱️ 時間到",
        dashBonus: "Dash 的速度加成為你的時鐘增加了額外的秒數！",
      },

      bugHunt: {
        name: "抓蟲行動",
        desc: "找出有錯誤的那一行，然後選出修正方式 — 在時間耗盡前完成。",
        winTitle: "🐞 抓蟲完成！",
        loseTitle: "🔍 下次再加油",
        debuggerBonus: "你的 Debugger 銳利的眼光提升了你的分數！",
        findPrompt: "點選有錯誤的那一行：",
        fixPrompt: "現在選擇修正方式：",
      },

      predictOutput: {
        name: "預測輸出",
        desc: "閱讀程式碼，猜猜它會印出什麼 — 快節奏回合，毫不留情。",
        winTitle: "🔮 猜中了！",
        loseTitle: "💭 就差一點！",
        scopeBonus: "Scope 在你作答前揭露了一個錯誤選項！",
      },

      codeGolf: {
        name: "程式碼高爾夫",
        desc: "每個人都解同一道題 — 最短的可行解法獲勝。",
        winTitle: "⛳ 解出來了！",
        loseTitle: "⏱️ 時間到",
        yourLines: "你的行數",
        par: "標準桿",
        lines: "行",
        trimBonus: "Trim 的重構加成幫你的分數多加了一些！",
      },

      showdown: {
        name: "生存對決",
        desc: "盡可能撐下去 — 答錯一題就出局。",
        winTitle: "🥇 對決冠軍！",
        loseTitle: "💥 已淘汰",
        roundsSurvived: "存活回合數",
        nullPointerSave: "Null Pointer 的連續保護拯救了你的紀錄！",
        getReady: "準備好...",
      },

      debugDuel: {
        name: "除錯對決",
        desc: "與幽靈時間競速，率先找到並修正錯誤。",
        winTitle: "⚔️ 對決獲勝！",
        loseTitle: "💀 對決落敗",
        yourTime: "你的時間",
        ghostTime: "幽靈時間",
        beatGhost: "你打敗了幽靈的時間！",
        tankBonus: "Bastion 的堅韌給了你一條額外的生命！",
      },

      chaosRound: {
        name: "混亂回合",
        desc: "熟悉的題型，加上隨機的變化。什麼事都可能發生！",
        winTitle: "🌀 馴服混亂！",
        loseTitle: "💫 這次混亂獲勝",
        modifier: "修飾條件",
        glitchBonus: "Glitch 把你的落敗變成了幸運的平局！",
        modifiers: {
          doublePoints: { name: "雙倍分數", desc: "贏得這回合可獲得雙倍排名點數。" },
          halfTime: { name: "時間減半", desc: "時鐘減半 — 動作要快！" },
          oneShot: { name: "一擊必殺", desc: "沒有重試機會。只有一次作答，把握機會。" },
          noHints: { name: "沒有提示", desc: "這回合會隱藏教學內容與解說。" },
        },
      },

      relay: {
        name: "接力賽",
        desc: "2 到 4 人的團隊接力賽 — 等團隊配對功能準備好後就會推出。",
        comingSoon: "接力賽需要真正的隊友才能進行，所以還在製作中。敬請期待！",
      },

      shuffle: {
        title: "洗牌中...",
        spinning: "轉盤轉動中...",
        landed: "你抽到了：",
        reshuffle: "重新洗牌",
        go: "出發！→",
      },
    },

    sideQuestMap: {
      title: "支線任務 🧭",
      subtitle: "28 個關於真實工具的短課程 —",
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
      privacyNote: "🔒 我們會安全地儲存你的電子郵件與進度——絕不投放廣告。未滿 13 歲嗎？請先問問家長！",
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
      privacyNote: "訪客模式的所有資料只會留在這台裝置上。建立帳號會安全地儲存你的電子郵件與進度——沒有廣告，也不會販售資料。未滿 13 歲嗎？請先問問家長！",
      syncGuest: "進度只儲存在這台裝置上。登入後即可安全備份到雲端。",
      syncSaving: "正在儲存到雲端…",
      syncSaved: "進度已儲存到你的帳號 ☁️",
      syncError: "無法連線到雲端——進度已安全存在這台裝置，恢復連線後會自動同步。",
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

    rankedModes: {
      selectTitle: "모드를 선택하세요 🎮",
      selectSubtitle: "항상 열려있는 두 가지 모드와 매일 바뀌는 모드 — 프로처럼!",
      rotationBadge: "🔄 오늘만",
      comingSoonBadge: "🚧 출시 예정",
      archetypeBonus: "보너스 대상:",
      round: "라운드",
      roundsCompleted: "완료한 라운드",
      timeLeft: "남은 시간",
      score: "점수",
      nextRound: "다음 라운드 →",
      finish: "완료 →",
      continue: "계속하기 →",
      backToLobby: "← 랭크 모드로 돌아가기",

      codeRace: {
        name: "코드 레이스",
        desc: "시간이 다 되기 전에 코딩 퍼즐을 연달아 풀어보세요.",
        winTitle: "🏁 레이스 완주!",
        loseTitle: "⏱️ 시간 종료",
        dashBonus: "Dash의 속도 보너스로 시계에 시간이 추가됐어요!",
      },

      bugHunt: {
        name: "버그 헌트",
        desc: "버그가 있는 줄을 찾고 수정 방법을 고르세요 — 시간이 다 되기 전에.",
        winTitle: "🐞 버그 헌트 완료!",
        loseTitle: "🔍 다음 기회에",
        debuggerBonus: "디버거의 날카로운 눈썰미로 점수가 올라갔어요!",
        findPrompt: "버그가 있는 줄을 탭하세요:",
        fixPrompt: "이제 수정 방법을 고르세요:",
      },

      predictOutput: {
        name: "출력 예측",
        desc: "코드를 읽고 무엇이 출력될지 맞혀보세요 — 빠른 라운드, 봐주기 없음.",
        winTitle: "🔮 정확해요!",
        loseTitle: "💭 아깝네요!",
        scopeBonus: "Scope가 답을 고르기 전에 오답 하나를 보여줬어요!",
      },

      codeGolf: {
        name: "코드 골프",
        desc: "모두 같은 문제를 풀어요 — 가장 짧은 정답 코드가 이깁니다.",
        winTitle: "⛳ 풀었어요!",
        loseTitle: "⏱️ 시간 초과",
        yourLines: "내 코드 줄 수",
        par: "기준 줄 수",
        lines: "줄",
        trimBonus: "Trim의 리팩토링 보너스로 점수가 더 올라갔어요!",
      },

      showdown: {
        name: "서바이벌 대결",
        desc: "최대한 오래 버티세요 — 한 번이라도 틀리면 탈락이에요.",
        winTitle: "🥇 서바이벌 챔피언!",
        loseTitle: "💥 탈락",
        roundsSurvived: "생존한 라운드",
        nullPointerSave: "Null Pointer의 연속 보호로 살아남았어요!",
        getReady: "준비하세요...",
      },

      debugDuel: {
        name: "디버그 듀얼",
        desc: "고스트 기록과 경쟁하며 누가 먼저 버그를 찾아 고치는지 겨뤄보세요.",
        winTitle: "⚔️ 듀얼 승리!",
        loseTitle: "💀 듀얼 패배",
        yourTime: "내 기록",
        ghostTime: "고스트 기록",
        beatGhost: "고스트의 기록을 이겼어요!",
        tankBonus: "Bastion의 강인함 덕분에 생명이 하나 더 생겼어요!",
      },

      chaosRound: {
        name: "카오스 라운드",
        desc: "익숙한 문제에 무작위 변화가 더해져요. 무슨 일이든 일어날 수 있어요!",
        winTitle: "🌀 카오스 정복!",
        loseTitle: "💫 이번엔 카오스 승리",
        modifier: "수정 조건",
        glitchBonus: "Glitch가 패배를 운 좋은 무승부로 바꿔줬어요!",
        modifiers: {
          doublePoints: { name: "점수 두 배", desc: "이 라운드에서 이기면 랭크 점수가 두 배가 돼요." },
          halfTime: { name: "시간 절반", desc: "시계가 절반으로 줄어요 — 빨리 생각하세요!" },
          oneShot: { name: "단판 승부", desc: "재도전 없이 한 번의 답으로 승부를 봐요." },
          noHints: { name: "힌트 없음", desc: "이 라운드는 튜토리얼과 설명이 숨겨져 있어요." },
        },
      },

      relay: {
        name: "릴레이",
        desc: "2~4인 팀 릴레이 — 팀 매칭 기능이 준비되면 만나볼 수 있어요.",
        comingSoon: "릴레이는 진짜 팀원이 필요해서 아직 준비 중이에요. 곧 다시 확인해주세요!",
      },

      shuffle: {
        title: "셔플 중...",
        spinning: "돌아가는 중...",
        landed: "당첨된 모드:",
        reshuffle: "다시 셔플",
        go: "시작하기! →",
      },
    },

    sideQuestMap: {
      title: "사이드 퀘스트 🧭",
      subtitle: "실전 도구를 다루는 28개의 짧은 코스 —",
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
      privacyNote: "🔒 이메일과 진행 상황을 안전하게 저장할게요 — 광고는 절대 없어요. 13세 미만이라면 먼저 부모님께 여쭤보세요!",
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
      privacyNote: "게스트 모드에서는 모든 데이터가 이 기기에만 저장돼요. 계정을 만들면 이메일과 진행 상황이 안전하게 저장돼요 — 광고도 없고 데이터를 팔지도 않아요. 13세 미만이라면 먼저 부모님께 여쭤보세요!",
      syncGuest: "진행 상황은 이 기기에만 저장돼요. 로그인하면 클라우드에 안전하게 보관돼요.",
      syncSaving: "클라우드에 저장 중…",
      syncSaved: "진행 상황이 계정에 저장되었어요 ☁️",
      syncError: "클라우드에 연결할 수 없어요 — 진행 상황은 이 기기에 안전하게 있고 다시 온라인이 되면 동기화돼요.",
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
