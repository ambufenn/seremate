export type AppLanguage =
  | 'en'
  | 'id'
  | 'zh'
  | 'ja'
  | 'sw'
  | 'fr'
  | 'ar'
  | 'es'
  | 'ko'
  | 'hi';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  regionHint: string;
  shortLabel: string;
  dir?: 'ltr' | 'rtl';
}

export const APP_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', regionHint: 'Global', shortLabel: 'EN' },
  { code: 'id', label: 'Bahasa Indonesia', regionHint: 'Indonesia', shortLabel: 'ID' },
  { code: 'zh', label: '中文 (简体)', regionHint: 'China', shortLabel: '中文' },
  { code: 'ja', label: '日本語', regionHint: 'Japan', shortLabel: '日本語' },
  { code: 'sw', label: 'Kiswahili', regionHint: 'East Africa', shortLabel: 'SW' },
  { code: 'fr', label: 'Français', regionHint: 'Africa & Global', shortLabel: 'FR' },
  { code: 'ar', label: 'العربية', regionHint: 'North Africa / Arabic', shortLabel: 'AR', dir: 'rtl' },
  { code: 'es', label: 'Español', regionHint: 'Spanish', shortLabel: 'ES' },
  { code: 'ko', label: '한국어', regionHint: 'Korea', shortLabel: '한국어' },
  { code: 'hi', label: 'हिन्दी', regionHint: 'India', shortLabel: 'HI' },
];

export const LANGUAGE_STORAGE_KEY = 'seremate_language_v1';

export function getStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null;
    if (saved && APP_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'en';
}

export function saveStoredLanguage(lang: AppLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
}

export interface UiStrings {
  tagline: string;
  nav: {
    home: string;
    askSere: string;
    community: string;
    safeCare: string;
    guides: string;
    clinics: string;
  };
  auth: {
    demoBadge: string;
    demoTitle: string;
    demoDesc: string;
    demoButton: string;
    orSignIn: string;
    welcomeHi: string;
    welcomeSubtitle: string;
    signIn: string;
    createAccount: string;
  };
  dashboard: {
    greetingPrefix: string;
    heroTitle: string;
    howFeeling: string;
    talkToSere: string;
    pregnancyCare: string;
    peerActivity: string;
    exploreTitle: string;
    exploreSub: string;
    findSupport: string;
    moodLabels: {
      calm: string;
      curious: string;
      worried: string;
      overwhelmed: string;
      hopeful: string;
    };
  };
  companion: {
    title: string;
    subtitle: string;
    newChat: string;
    safeTitle: string;
    mindTitle: string;
    mindDesc: string;
    placeholder: string;
    send: string;
    replying: string;
    starters: string[];
  };
  community: {
    badge: string;
    title: string;
    subtitle: string;
  };
  pregnancy: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

const EN_STRINGS: UiStrings = {
  tagline: 'Your Questions Deserve Care, Not Judgment.',
  nav: {
    home: 'Home',
    askSere: 'Ask Sere',
    community: 'Community',
    safeCare: 'Safe Care',
    guides: 'Guides',
    clinics: 'Clinics',
  },
  auth: {
    demoBadge: 'No Login Needed',
    demoTitle: 'Try Instant Demo',
    demoDesc: 'Explore Sere AI chat, peer circles, safe pregnancy care & clinics right away.',
    demoButton: 'Enter Demo Without Login',
    orSignIn: 'Or sign in with your account',
    welcomeHi: "Hi! I'm Sere.",
    welcomeSubtitle: 'Your safe space to learn, ask privately, and find kind support without judgment.',
    signIn: 'Sign In',
    createAccount: 'Create Account',
  },
  dashboard: {
    greetingPrefix: 'Safe & Private Space',
    heroTitle: "Hi! I'm Sere, your companion.",
    howFeeling: 'How are you feeling today?',
    talkToSere: 'Talk to Sere',
    pregnancyCare: 'Pregnancy & Safe Care',
    peerActivity: 'Peer Activity',
    exploreTitle: 'Choose what feels helpful right now',
    exploreSub: 'Explore at Your Own Pace',
    findSupport: 'Find Support',
    moodLabels: {
      calm: 'Calm',
      curious: 'Curious',
      worried: 'Worried',
      overwhelmed: 'Overwhelmed',
      hopeful: 'Hopeful',
    },
  },
  companion: {
    title: 'Ask Sere',
    subtitle: 'Kind, private & caring',
    newChat: 'New Chat',
    safeTitle: 'Sere · Safe & Judgment-Free',
    mindTitle: 'What is on your mind today?',
    mindDesc: 'Ask in your preferred language, or tap one of these gentle starting questions:',
    placeholder: 'Ask Sere a question privately...',
    send: 'Send',
    replying: 'Sere is replying…',
    starters: [
      'I am worried my period is late and I am nervous to ask anyone.',
      'How do I know if period cramps are normal or need a doctor?',
      'Someone is pressuring me online for private photos—what can I do?',
      'What happens during a first confidential clinic appointment?',
    ],
  },
  community: {
    badge: 'Peer & Community Activity · Safe & Anonymous',
    title: 'Kind circles & peer encouragement',
    subtitle:
      'Join youth wellness challenges, send caring hugs, and share uplifting notes using a cute nickname—no real names or personal contact info ever shared.',
  },
  pregnancy: {
    badge: 'Pregnancy Check & Safe Care Companion',
    title: 'Are you pregnant right now? Please stay safe & keep healthy.',
    subtitle:
      'Whether you just saw a positive test, missed a period and feel nervous, or are learning for a friend—you deserve gentleness, privacy, and clear care.',
  },
};

const TRANSLATIONS: Record<AppLanguage, UiStrings> = {
  en: EN_STRINGS,
  id: {
    tagline: 'Pertanyaanmu Layak Mendapat Perhatian, Bukan Penghakiman.',
    nav: {
      home: 'Beranda',
      askSere: 'Tanya Sere',
      community: 'Komunitas',
      safeCare: 'Perawatan',
      guides: 'Panduan',
      clinics: 'Klinik',
    },
    auth: {
      demoBadge: 'Tanpa Login',
      demoTitle: 'Coba Demo Instan',
      demoDesc: 'Jelajahi chat AI Sere, aktivitas komunitas, cek kehamilan & klinik langsung tanpa daftar.',
      demoButton: 'Masuk Demo Tanpa Login',
      orSignIn: 'Atau masuk dengan akunmu',
      welcomeHi: 'Hai! Aku Sere.',
      welcomeSubtitle: 'Ruang amanmu untuk belajar, bertanya secara privat, dan mendapat dukungan tanpa penghakiman.',
      signIn: 'Masuk',
      createAccount: 'Buat Akun',
    },
    dashboard: {
      greetingPrefix: 'Ruang Aman & Privat',
      heroTitle: 'Hai! Aku Sere, teman ceritamu.',
      howFeeling: 'Bagaimana perasaanmu hari ini?',
      talkToSere: 'Ngobrol dengan Sere',
      pregnancyCare: 'Cek Kehamilan & Sehat',
      peerActivity: 'Aktivitas Komunitas',
      exploreTitle: 'Pilih yang paling membantumu saat ini',
      exploreSub: 'Jelajahi Sesuai Ritmemu',
      findSupport: 'Cari Bantuan',
      moodLabels: {
        calm: 'Tenang',
        curious: 'Penasaran',
        worried: 'Khawatir',
        overwhelmed: 'Kewalahan',
        hopeful: 'Berharap',
      },
    },
    companion: {
      title: 'Tanya Sere',
      subtitle: 'Ramah, privat & peduli',
      newChat: 'Chat Baru',
      safeTitle: 'Sere · Aman & Tanpa Penghakiman',
      mindTitle: 'Apa yang sedang ada di pikiranmu hari ini?',
      mindDesc: 'Tanyakan dengan bahasamu sendiri, atau pilih salah satu pertanyaan awal berikut:',
      placeholder: 'Tanya Sere secara rahasia...',
      send: 'Kirim',
      replying: 'Sere sedang membalas…',
      starters: [
        'Aku khawatir haidku telat dan takut cerita ke siapa pun.',
        'Bagaimana cara tahu kram haid itu normal atau perlu ke dokter?',
        'Ada yang memaksaku kirim foto pribadi secara online—harus bagaimana?',
        'Apa saja yang terjadi saat pemeriksaan rahasia di klinik remaja?',
      ],
    },
    community: {
      badge: 'Aktivitas Teman Sebaya & Komunitas · Aman & Anonim',
      title: 'Lingkar dukungan & penyemangat sebaya',
      subtitle:
        'Ikuti tantangan kesehatan remaja, kirim pelukan virtual, dan bagikan pesan positif memakai nama samaran lucu—tanpa nama asli atau kontak pribadi.',
    },
    pregnancy: {
      badge: 'Cek Kehamilan & Pendamping Hidup Sehat',
      title: 'Apakah kamu sedang hamil saat ini? Jaga keselamatan dan kesehatanmu ya.',
      subtitle:
        'Baik saat baru melihat hasil tes positif, telat haid dan merasa cemas, atau belajar untuk teman—kamu berhak mendapat perawatan yang lembut dan rahasia.',
    },
  },
  zh: {
    tagline: '你的每一个疑问都值得被温柔倾听，而非评判。',
    nav: {
      home: '首页',
      askSere: '问问 Sere',
      community: '同伴社区',
      safeCare: '安全护理',
      guides: '健康指南',
      clinics: '诊所支持',
    },
    auth: {
      demoBadge: '免登录体验',
      demoTitle: '立即试用演示',
      demoDesc: '无需注册即可体验 Sere AI 对话、同伴活动、孕期健康关怀与青年诊所导航。',
      demoButton: '免登录进入体验',
      orSignIn: '或使用账号登录',
      welcomeHi: '你好！我是 Sere。',
      welcomeSubtitle: '这是一个属于你的安全私密空间，可以安心学习、提问并获得温柔支持。',
      signIn: '登录',
      createAccount: '注册账号',
    },
    dashboard: {
      greetingPrefix: '安全私密空间',
      heroTitle: '你好！我是你的伙伴 Sere。',
      howFeeling: '今天感觉怎么样？',
      talkToSere: '和 Sere 聊聊',
      pregnancyCare: '孕期与安全关怀',
      peerActivity: '同伴社区活动',
      exploreTitle: '选择现在最能帮到你的内容',
      exploreSub: '按自己的节奏探索',
      findSupport: '寻找支持',
      moodLabels: {
        calm: '平静',
        curious: '好奇',
        worried: '担心',
        overwhelmed: '不知所措',
        hopeful: '充满希望',
      },
    },
    companion: {
      title: '问问 Sere',
      subtitle: '友善 · 私密 · 关怀',
      newChat: '新对话',
      safeTitle: 'Sere · 安全无评判',
      mindTitle: '今天有什么想聊的吗？',
      mindDesc: '用中文自由提问，或点击下方常见话题开始交流：',
      placeholder: '向 Sere 私密提问...',
      send: '发送',
      replying: 'Sere 正在回复…',
      starters: [
        '我担心月经推迟了，但又不敢告诉任何人。',
        '怎么判断经期痛经是正常的还是需要看医生？',
        '有人在网上施压索要我的隐私照片，我该怎么办？',
        '第一次去青少年保密诊所检查通常会做些什么？',
      ],
    },
    community: {
      badge: '同伴与社区活动 · 安全匿名',
      title: '温暖小组与同伴鼓励墙',
      subtitle: '参与青少年健康挑战，送出暖心拥抱，使用可爱昵称分享鼓励话语——绝不公开真实姓名或联系方式。',
    },
    pregnancy: {
      badge: '孕期关怀与日常安全守护',
      title: '你现在怀孕了吗？请务必保护自己并保持健康。',
      subtitle: '无论你是刚测出阳性、月经推迟感到紧张，还是想帮朋友了解——你都值得被温柔、保密且清晰地照顾。',
    },
  },
  ja: {
    tagline: 'あなたの疑問は、批判ではなく思いやりで受け止められるべきです。',
    nav: {
      home: 'ホーム',
      askSere: 'Sereに相談',
      community: 'コミュニティ',
      safeCare: '安心ケア',
      guides: 'ガイド',
      clinics: '相談窓口',
    },
    auth: {
      demoBadge: 'ログイン不要',
      demoTitle: 'すぐにお試しデモ',
      demoDesc: 'アカウント登録なしでSere AI相談、コミュニティ活動、安心ケア、相談窓口を体験できます。',
      demoButton: 'ログインせずデモを始める',
      orSignIn: 'またはアカウントでサインイン',
      welcomeHi: 'こんにちは！Sereです。',
      welcomeSubtitle: '批判されることなく、安心して学び、相談し、サポートを見つけられる安全な場所です。',
      signIn: 'サインイン',
      createAccount: 'アカウント作成',
    },
    dashboard: {
      greetingPrefix: '安心・プライベート空間',
      heroTitle: 'こんにちは！あなたの味方、Sereです。',
      howFeeling: '今日の気分はどうですか？',
      talkToSere: 'Sereと話す',
      pregnancyCare: '妊娠チェック＆ケア',
      peerActivity: 'みんなの活動',
      exploreTitle: '今の気持ちに合うものを選んでね',
      exploreSub: '自分のペースで探してみよう',
      findSupport: '窓口を探す',
      moodLabels: {
        calm: '落ち着いている',
        curious: '気になる',
        worried: '不安',
        overwhelmed: 'いっぱい',
        hopeful: '前向き',
      },
    },
    companion: {
      title: 'Sereに相談',
      subtitle: 'やさしく・秘密厳守',
      newChat: '新しい相談',
      safeTitle: 'Sere · 安心＆ノー・ジャッジメント',
      mindTitle: '今、どんなことが気になっていますか？',
      mindDesc: '日本語で自由に質問するか、下の質問例をタップしてみてください：',
      placeholder: 'Sereに安心して質問してみる...',
      send: '送信',
      replying: 'Sereが返信中…',
      starters: [
        '生理が遅れていて心配ですが、誰にも相談できず怖いです。',
        '生理痛が普通の範囲か、病院に行くべきかどう判断すればいい？',
        'ネットでプライベートな写真を求められて困っています。',
        'ユースクリニックの秘密厳守の初診では何をしますか？',
      ],
    },
    community: {
      badge: 'ピア＆コミュニティ活動 · 安全・匿名',
      title: 'やさしい仲間と応援メッセージ',
      subtitle: 'ニックネームを使って安心して健康チャレンジに参加したり、ハグや励ましの言葉を送り合えます。',
    },
    pregnancy: {
      badge: '妊娠確認＆健康サポート',
      title: '今、妊娠していますか？どうか安全と健康を大切にしてね。',
      subtitle: '陽性反応が出たばかりでも、生理の遅れで不安でも、友達のために調べていても—プライバシーとやさしいケアが受けられます。',
    },
  },
  sw: {
    tagline: 'Maswali Yako Yanastahili Huduma na Upendo, Sio Hukumu.',
    nav: {
      home: 'Nyumbani',
      askSere: 'Uliza Sere',
      community: 'Jamii',
      safeCare: 'Afya Salama',
      guides: 'Miongozo',
      clinics: 'Kliniki',
    },
    auth: {
      demoBadge: 'Bila Kuingia',
      demoTitle: 'Jaribu Demo Haraka',
      demoDesc: 'Tumia gumzo la Sere AI, shughuli za vijana, mwongozo wa ujauzito na kliniki mara moja.',
      demoButton: 'Ingia Kwenye Demo Bila Akaunti',
      orSignIn: 'Au ingia kwa akaunti yako',
      welcomeHi: 'Habari! Mimi ni Sere.',
      welcomeSubtitle: 'Nafasi yako salama na ya siri ya kujifunza, kuuliza maswali na kupata msaada bila kuhukumiwa.',
      signIn: 'Ingia',
      createAccount: 'Fungua Akaunti',
    },
    dashboard: {
      greetingPrefix: 'Nafasi Salama na ya Siri',
      heroTitle: 'Habari! Mimi ni Sere, rafiki yako.',
      howFeeling: 'Unajisikiaje leo?',
      talkToSere: 'Zungumza na Sere',
      pregnancyCare: 'Ujauzito na Usalama',
      peerActivity: 'Shughuli za Vijana',
      exploreTitle: 'Chagua kinachokusaidia sasa hivi',
      exploreSub: 'Jifunze kwa Kasi Yako',
      findSupport: 'Tafuta Msaada',
      moodLabels: {
        calm: 'Mtulivu',
        curious: 'Mdadisi',
        worried: 'Nina Wasiwasi',
        overwhelmed: 'Nimelemewa',
        hopeful: 'Nina Matumaini',
      },
    },
    companion: {
      title: 'Uliza Sere',
      subtitle: 'Mpole, siri na anajali',
      newChat: 'Gumzo Jipya',
      safeTitle: 'Sere · Salama Bila Hukumu',
      mindTitle: 'Unafikiria nini leo?',
      mindDesc: 'Uliza kwa Kiswahili au lugha yako, au chagua mojawapo ya maswali haya:',
      placeholder: 'Muulize Sere swali kwa siri...',
      send: 'Tuma',
      replying: 'Sere anajibu…',
      starters: [
        'Nina wasiwasi hedhi yangu imechelewa na naogopa kumwambia mtu.',
        'Nitajuaje kama maumivu ya hedhi ni ya kawaida au yanahitaji daktari?',
        'Mtu ananisumbua mtandaoni kutaka picha binafsi—nifanye nini?',
        'Nini hufanyika wakati wa ziara ya siri ya kliniki ya vijana?',
      ],
    },
    community: {
      badge: 'Shughuli za Vijana na Jamii · Salama na Bila Jina Halisi',
      title: 'Vikundi vyema na kutiana moyo',
      subtitle: 'Jiunge na shughuli za afya ya vijana, tuma salamu za upendo na shiriki ujumbe mzuri kwa kutumia jina la siri.',
    },
    pregnancy: {
      badge: 'Ukaguzi wa Ujauzito na Afya Salama',
      title: 'Je, una ujauzito sasa hivi? Tafadhali kuwa salama na jali afya yako.',
      subtitle: 'Iwe umepata kipimo chanya, hedhi imechelewa, au unamsaidia rafiki—unastahili upole, faragha na huduma bora.',
    },
  },
  fr: {
    tagline: 'Vos questions méritent bienveillance et écoute, sans jugement.',
    nav: {
      home: 'Accueil',
      askSere: 'Demander à Sere',
      community: 'Communauté',
      safeCare: 'Soins Sûrs',
      guides: 'Guides',
      clinics: 'Cliniques',
    },
    auth: {
      demoBadge: 'Sans Connexion',
      demoTitle: 'Essayer la Démo Instantanée',
      demoDesc: 'Explorez le chat IA Sere, la communauté, les conseils grossesse et les cliniques jeunesse.',
      demoButton: 'Entrer en Démo sans compte',
      orSignIn: 'Ou connectez-vous à votre compte',
      welcomeHi: 'Salut ! Je suis Sere.',
      welcomeSubtitle: 'Votre espace sûr et privé pour apprendre, poser vos questions et trouver du soutien sans jugement.',
      signIn: 'Se connecter',
      createAccount: 'Créer un compte',
    },
    dashboard: {
      greetingPrefix: 'Espace Sûr & Privé',
      heroTitle: 'Salut ! Je suis Sere, ton allié.',
      howFeeling: 'Comment te sens-tu aujourd’hui ?',
      talkToSere: 'Parler à Sere',
      pregnancyCare: 'Grossesse & Santé Sûre',
      peerActivity: 'Activités entre pairs',
      exploreTitle: 'Choisis ce qui t’aide en ce moment',
      exploreSub: 'Explore à ton rythme',
      findSupport: 'Trouver de l’aide',
      moodLabels: {
        calm: 'Calme',
        curious: 'Curieux·se',
        worried: 'Inquiet·ète',
        overwhelmed: 'Dépassé·e',
        hopeful: 'Plein·e d’espoir',
      },
    },
    companion: {
      title: 'Demander à Sere',
      subtitle: 'Doux, privé & attentif',
      newChat: 'Nouveau chat',
      safeTitle: 'Sere · Sûr & Sans Jugement',
      mindTitle: 'Qu’as-tu en tête aujourd’hui ?',
      mindDesc: 'Pose ta question librement ou choisis une question ci-dessous :',
      placeholder: 'Pose une question en privé à Sere...',
      send: 'Envoyer',
      replying: 'Sere répond…',
      starters: [
        'J’ai peur car mes règles sont en retard et je n’ose en parler à personne.',
        'Comment savoir si mes crampes menstruelles sont normales ?',
        'Quelqu’un me met la pression en ligne pour des photos privées—que faire ?',
        'Comment se passe une première visite confidentielle en clinique jeunesse ?',
      ],
    },
    community: {
      badge: 'Activités & Communauté · Sûr et Anonyme',
      title: 'Cercles bienveillants & entraide',
      subtitle: 'Participe aux défis bien-être, envoie des câlins virtuels et partage des encouragements sous pseudo anonyme.',
    },
    pregnancy: {
      badge: 'Suivi Grossesse & Santé Sûre',
      title: 'Es-tu enceinte en ce moment ? Reste en sécurité et prends soin de toi.',
      subtitle: 'Test positif, retard de règles ou soutien à un·e ami·e : tu mérites douceur, confidentialité et soins fiables.',
    },
  },
  ar: {
    tagline: 'أسئلتك تستحق الرعاية والاهتمام، لا الحكم.',
    nav: {
      home: 'الرئيسية',
      askSere: 'اسأل Sere',
      community: 'المجتمع',
      safeCare: 'رعاية آمنة',
      guides: 'الأدلة',
      clinics: 'العيادات',
    },
    auth: {
      demoBadge: 'بدون تسجيل دخول',
      demoTitle: 'جرّب العرض الفوري',
      demoDesc: 'استكشف محادثة Sere الذكية، مجتمع الشباب، رعاية الحمل والعيادات الداعمة فوراً.',
      demoButton: 'الدخول للتجربة بدون حساب',
      orSignIn: 'أو سجّل الدخول بحسابك',
      welcomeHi: 'مرحباً! أنا Sere.',
      welcomeSubtitle: 'مساحتك الآمنة والخاصة للتعلم وطرح الأسئلة والحصول على دعم لطيف بدون حكم.',
      signIn: 'تسجيل الدخول',
      createAccount: 'إنشاء حساب',
    },
    dashboard: {
      greetingPrefix: 'مساحة آمنة وخاصة',
      heroTitle: 'مرحباً! أنا Sere، رفيقك الداعم.',
      howFeeling: 'كيف تشعر اليوم؟',
      talkToSere: 'تحدث مع Sere',
      pregnancyCare: 'الحمل والرعاية الصحية',
      peerActivity: 'أنشطة الأقران',
      exploreTitle: 'اختر ما يناسبك ويساعدك الآن',
      exploreSub: 'استكشف بالسرعة التي تناسبك',
      findSupport: 'ابحث عن دعم',
      moodLabels: {
        calm: 'هادئ',
        curious: 'فضولي',
        worried: 'قلق',
        overwhelmed: 'مرهق',
        hopeful: 'متفائل',
      },
    },
    companion: {
      title: 'اسأل Sere',
      subtitle: 'لطيف، خاص ومهتم',
      newChat: 'محادثة جديدة',
      safeTitle: 'Sere · آمن وبدون أحكام',
      mindTitle: 'ما الذي يشغل بالك اليوم؟',
      mindDesc: 'اسأل بلغتك بحرية، أو اختر أحد الأسئلة التالية:',
      placeholder: 'اسأل Sere بخصوصية تامة...',
      send: 'إرسال',
      replying: 'Sere يكتب الرد…',
      starters: [
        'أنا قلقة لأن دورتي الشهرية متأخرة وأخاف إخبار أي شخص.',
        'كيف أعرف إذا كانت تقلصات الدورة طبيعية أم تحتاج لطبيب؟',
        'شخص يضغط عليّ عبر الإنترنت لصور خاصة—ماذا أفعل؟',
        'ماذا يحدث خلال أول زيارة سرية لعيادة الشباب؟',
      ],
    },
    community: {
      badge: 'أنشطة الأقران والمجتمع · آمن ومجهول الهوية',
      title: 'حلقات لطيفة وتشجيع متبادل',
      subtitle: 'شارك في تحديات صحة الشباب وأرسل كلمات دعم باسم مستعار دون مشاركة أي معلومات شخصية.',
    },
    pregnancy: {
      badge: 'متابعة الحمل والرعاية الصحية الآمنة',
      title: 'هل أنتِ حامل الآن؟ حافظي على سلامتك وصحتك.',
      subtitle: 'سواء كانت نتيجة الاختبار إيجابية، أو تأخرت الدورة، أو تدعمين صديقة—تستحقين اللطف والخصوصية والرعاية الواضحة.',
    },
  },
  es: {
    tagline: 'Tus preguntas merecen cuidado y respeto, sin juicios.',
    nav: {
      home: 'Inicio',
      askSere: 'Pregunta a Sere',
      community: 'Comunidad',
      safeCare: 'Cuidado Seguro',
      guides: 'Guías',
      clinics: 'Clínicas',
    },
    auth: {
      demoBadge: 'Sin Registro',
      demoTitle: 'Probar Demo Instantánea',
      demoDesc: 'Explora el chat con Sere IA, comunidad juvenil, cuidado del embarazo y clínicas ahora mismo.',
      demoButton: 'Entrar a la Demo sin cuenta',
      orSignIn: 'O inicia sesión con tu cuenta',
      welcomeHi: '¡Hola! Soy Sere.',
      welcomeSubtitle: 'Tu espacio seguro y privado para aprender, preguntar y encontrar apoyo sin juicios.',
      signIn: 'Iniciar sesión',
      createAccount: 'Crear cuenta',
    },
    dashboard: {
      greetingPrefix: 'Espacio Seguro y Privado',
      heroTitle: '¡Hola! Soy Sere, tu acompañante.',
      howFeeling: '¿Cómo te sientes hoy?',
      talkToSere: 'Hablar con Sere',
      pregnancyCare: 'Embarazo y Salud',
      peerActivity: 'Actividad Juvenil',
      exploreTitle: 'Elige lo que te ayude en este momento',
      exploreSub: 'Explora a tu ritmo',
      findSupport: 'Buscar Apoyo',
      moodLabels: {
        calm: 'Tranquilo/a',
        curious: 'Curioso/a',
        worried: 'Preocupado/a',
        overwhelmed: 'Abrumado/a',
        hopeful: 'Con esperanza',
      },
    },
    companion: {
      title: 'Pregunta a Sere',
      subtitle: 'Amable, privado y atento',
      newChat: 'Nuevo chat',
      safeTitle: 'Sere · Seguro y Sin Juicios',
      mindTitle: '¿Qué tienes en mente hoy?',
      mindDesc: 'Pregunta con tus propias palabras o elige una pregunta inicial:',
      placeholder: 'Pregúntale a Sere en privado...',
      send: 'Enviar',
      replying: 'Sere está respondiendo…',
      starters: [
        'Me preocupa que mi periodo esté retrasado y tengo miedo de contarlo.',
        '¿Cómo sé si los cólicos menstruales son normales o requieren médico?',
        'Alguien me presiona en línea para enviar fotos privadas—¿qué hago?',
        '¿Qué pasa en una primera cita confidencial en una clínica juvenil?',
      ],
    },
    community: {
      badge: 'Comunidad Juvenil · Segura y Anónima',
      title: 'Círculos amables y apoyo entre pares',
      subtitle: 'Únete a retos de bienestar, envía abrazos y comparte ánimo usando un apodo anónimo.',
    },
    pregnancy: {
      badge: 'Chequeo de Embarazo y Cuidado Diario',
      title: '¿Estás embarazada ahora? Cuídate y mantente segura y saludable.',
      subtitle: 'Ya sea por una prueba positiva, retraso menstrual o apoyar a una amiga, mereces cuidado amable y privado.',
    },
  },
  ko: {
    tagline: '당신의 질문은 판단이 아니라 따뜻한 돌봄을 받을 자격이 있습니다.',
    nav: {
      home: '홈',
      askSere: 'Sere에게 묻기',
      community: '커뮤니티',
      safeCare: '안전 케어',
      guides: '가이드',
      clinics: '클리닉',
    },
    auth: {
      demoBadge: '로그인 없이',
      demoTitle: '즉시 데모 체험',
      demoDesc: '회원가입 없이 Sere AI 채팅, 또래 커뮤니티, 임신 안전 케어 및 청소년 클리닉을 체험하세요.',
      demoButton: '로그인 없이 데모 시작',
      orSignIn: '또는 계정으로 로그인',
      welcomeHi: '안녕! 나는 Sere야.',
      welcomeSubtitle: '판단 없이 안전하고 비밀스럽게 배우고 질문하며 도움을 찾을 수 있는 공간입니다.',
      signIn: '로그인',
      createAccount: '계정 만들기',
    },
    dashboard: {
      greetingPrefix: '안전하고 비공개 공간',
      heroTitle: '안녕! 너의 건강 친구 Sere야.',
      howFeeling: '오늘 기분은 어때요?',
      talkToSere: 'Sere와 대화하기',
      pregnancyCare: '임신 & 안전 케어',
      peerActivity: '또래 활동',
      exploreTitle: '지금 도움이 되는 항목을 선택해 보세요',
      exploreSub: '나만의 속도로 둘러보기',
      findSupport: '도움 찾기',
      moodLabels: {
        calm: '평온함',
        curious: '궁금함',
        worried: '걱정됨',
        overwhelmed: '버거움',
        hopeful: '희망적임',
      },
    },
    companion: {
      title: 'Sere에게 묻기',
      subtitle: '따뜻하고 비밀스러운 대화',
      newChat: '새 대화',
      safeTitle: 'Sere · 안전하고 편견 없는 공간',
      mindTitle: '오늘 어떤 고민이 있나요?',
      mindDesc: '한국어로 편하게 질문하거나 아래 시작 질문을 눌러보세요:',
      placeholder: 'Sere에게 비밀스럽게 질문하기...',
      send: '보내기',
      replying: 'Sere가 답변 중…',
      starters: [
        '생리가 늦어져서 걱정되는데 아무에게도 말하기 무서워요.',
        '생리통이 정상 범위인지 병원에 가야 하는지 어떻게 알 수 있나요?',
        '온라인에서 누군가 개인 사진을 요구하며 압박해요. 어떡하죠?',
        '청소년 비밀 보장 클리닉 첫 방문 시 어떤 과정이 진행되나요?',
      ],
    },
    community: {
      badge: '또래 & 커뮤니티 활동 · 안전 익명',
      title: '따뜻한 모임 & 또래 응원 벽',
      subtitle: '귀여운 닉네임으로 청소년 웰니스 활동에 참여하고 따뜻한 포옹과 응원 메시지를 나눠보세요.',
    },
    pregnancy: {
      badge: '임신 확인 & 안전 건강 관리',
      title: '지금 임신 중인가요? 안전하고 건강하게 지내세요.',
      subtitle: '양성 반응이 나왔든, 생리가 늦어 불안하든, 친구를 돕고 싶든—따뜻하고 비밀스러운 돌봄을 받을 권리가 있습니다.',
    },
  },
  hi: {
    tagline: 'आपके सवाल देखभाल के हकदार हैं, किसी निर्णय या आलोचना के नहीं।',
    nav: {
      home: 'होम',
      askSere: 'Sere से पूछें',
      community: 'समुदाय',
      safeCare: 'सुरक्षित देखभाल',
      guides: 'गाइड',
      clinics: 'क्लिनिक',
    },
    auth: {
      demoBadge: 'बिना लॉगिन',
      demoTitle: 'तुरंत डेमो आज़माएँ',
      demoDesc: 'बिना अकाउंट बनाए Sere AI चैट, युवा समुदाय, सुरक्षित देखभाल और क्लिनिक देखें।',
      demoButton: 'बिना लॉगिन डेमो शुरू करें',
      orSignIn: 'या अपने अकाउंट से साइन इन करें',
      welcomeHi: 'नमस्ते! मैं Sere हूँ।',
      welcomeSubtitle: 'बिना किसी डर या आलोचना के सीखने, निजी सवाल पूछने और मदद पाने की सुरक्षित जगह।',
      signIn: 'साइन इन',
      createAccount: 'अकाउंट बनाएँ',
    },
    dashboard: {
      greetingPrefix: 'सुरक्षित और निजी स्थान',
      heroTitle: 'नमस्ते! मैं आपका साथी Sere हूँ।',
      howFeeling: 'आज आप कैसा महसूस कर रहे हैं?',
      talkToSere: 'Sere से बात करें',
      pregnancyCare: 'गर्भावस्था और सुरक्षा',
      peerActivity: 'साथी गतिविधि',
      exploreTitle: 'अभी जो मददगार लगे उसे चुनें',
      exploreSub: 'अपनी गति से जानें',
      findSupport: 'मदद खोजें',
      moodLabels: {
        calm: 'शांत',
        curious: 'जिज्ञासु',
        worried: 'चिंतित',
        overwhelmed: 'घबराया हुआ',
        hopeful: 'आशावादी',
      },
    },
    companion: {
      title: 'Sere से पूछें',
      subtitle: 'दयालु, निजी और देखभालपूर्ण',
      newChat: 'नई चैट',
      safeTitle: 'Sere · सुरक्षित और बिना आलोचना',
      mindTitle: 'आज आपके मन में क्या है?',
      mindDesc: 'अपनी भाषा में पूछें, या नीचे दिए किसी शुरुआती सवाल पर टैप करें:',
      placeholder: 'Sere से निजी रूप से सवाल पूछें...',
      send: 'भेजें',
      replying: 'Sere जवाब दे रहा है…',
      starters: [
        'मेरा पीरियड देर से आया है और मैं किसी को बताने से डर रही हूँ।',
        'कैसे पता चलेगा कि पीरियड का दर्द सामान्य है या डॉक्टर को दिखाना चाहिए?',
        'कोई ऑनलाइन निजी तस्वीरों के लिए दबाव डाल रहा है—मैं क्या करूँ?',
        'युवा क्लिनिक की पहली गोपनीय जाँच में क्या होता है?',
      ],
    },
    community: {
      badge: 'युवा समुदाय गतिविधि · सुरक्षित और गुमनाम',
      title: 'दयालु समूह और साथियों का प्रोत्साहन',
      subtitle: 'प्यारे उपनाम के साथ स्वास्थ्य चुनौतियों में जुड़ें और बिना असली नाम बताए एक-दूसरे का हौसला बढ़ाएँ।',
    },
    pregnancy: {
      badge: 'गर्भावस्था जाँच और सुरक्षित देखभाल',
      title: 'क्या आप अभी गर्भवती हैं? कृपया सुरक्षित और स्वस्थ रहें।',
      subtitle: 'चाहे टेस्ट पॉजिटिव आया हो, पीरियड लेट हो, या आप किसी दोस्त के लिए सीख रहे हों—आप सम्मान और गोपनीय देखभाल के हकदार हैं।',
    },
  },
};

export function getUiStrings(lang: AppLanguage): UiStrings {
  return TRANSLATIONS[lang] || EN_STRINGS;
}

export function getLanguageMeta(lang: AppLanguage): LanguageOption {
  return APP_LANGUAGES.find((l) => l.code === lang) || APP_LANGUAGES[0];
}
