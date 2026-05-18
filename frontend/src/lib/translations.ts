// Complete multilingual translation system — 11 Indian languages + English
export type Language = "en" | "hi" | "bn" | "te" | "ta" | "mr" | "gu" | "kn" | "ml" | "pa" | "or";

export const LANGUAGE_META: Record<Language, { native: string; english: string; browserCode: string; script: string }> = {
  en: { native: "English",    english: "English",    browserCode: "en",    script: "Latin"     },
  hi: { native: "हिंदी",      english: "Hindi",      browserCode: "hi",    script: "Devanagari"},
  bn: { native: "বাংলা",      english: "Bengali",    browserCode: "bn",    script: "Bengali"   },
  te: { native: "తెలుగు",     english: "Telugu",     browserCode: "te",    script: "Telugu"    },
  ta: { native: "தமிழ்",      english: "Tamil",      browserCode: "ta",    script: "Tamil"     },
  mr: { native: "मराठी",      english: "Marathi",    browserCode: "mr",    script: "Devanagari"},
  gu: { native: "ગુજરાતી",    english: "Gujarati",   browserCode: "gu",    script: "Gujarati"  },
  kn: { native: "ಕನ್ನಡ",      english: "Kannada",    browserCode: "kn",    script: "Kannada"   },
  ml: { native: "മലയാളം",     english: "Malayalam",  browserCode: "ml",    script: "Malayalam" },
  pa: { native: "ਪੰਜਾਬੀ",     english: "Punjabi",    browserCode: "pa",    script: "Gurmukhi"  },
  or: { native: "ଓଡ଼ିଆ",      english: "Odia",       browserCode: "or",    script: "Odia"      },
};

// Map from language key (used in chat) to translation code
export const LANG_KEY_TO_CODE: Record<string, Language> = {
  English: "en", Hindi: "hi", Bengali: "bn", Telugu: "te", Tamil: "ta",
  Marathi: "mr", Gujarati: "gu", Kannada: "kn", Malayalam: "ml", Punjabi: "pa", Odia: "or",
};

export interface Translations {
  // App branding
  appName: string; tagline: string; legalAI: string;
  // Navigation
  newConversation: string; tools: string; history: string; settings: string;
  emergency: string; logout: string; adminPanel: string;
  // Language settings
  inputLanguage: string; outputLanguage: string; voiceOutput: string; readRepliesAloud: string; simpleLanguage: string; simpleLanguageDesc: string;
  // Tools
  findNearestHelp: string; analyzeDocument: string; knowYourRights: string; rtiApplication: string;
  scanDocument: string; legalNews: string; guidedLegalHelp: string; findLawyer: string;
  legalTemplates: string; caseStatusTracker: string; fileFirDraft: string; dashboard: string; legalSearch: string;
  // Chat
  typeYourMessage: string; pressEnterToSend: string; askAnything: string; tapMicToSpeak: string;
  stopGenerating: string; shareWhatsApp: string; disclaimer: string;
  // Empty state topics
  familyLaw: string; consumerRights: string; propertyLaw: string; criminalLaw: string;
  // Actions
  continue: string; back: string; close: string; save: string; upload: string;
  delete: string; edit: string; cancel: string; confirm: string; generate: string; download: string; search: string;
  // Form fields
  fullName: string; age: string; gender: string; contact: string; email: string;
  address: string; city: string; state: string; district: string; pincode: string;
  // Status
  loading: string; success: string; error: string; tryAgain: string; noData: string;
  // Legal
  section: string; act: string; court: string; lawyer: string; case: string;
  petition: string; evidence: string; witness: string; complaint: string;
  // FIR
  firDraft: string; officialFormat: string; policeStation: string; yourDetails: string; incidentEvidence: string;
  // RTI
  rtiTitle: string; applicantDetails: string; informationSought: string;
  // Offline
  youAreOffline: string; backOnline: string; emergencyNumbers: string; offlineMessage: string;
  // Language picker
  chooseLanguage: string; chooseLanguageDesc: string; continueIn: string;
  // Free legal aid
  freeLegalAid: string; freeLegalAidDesc: string;
  // Login / Signup pages
  signIn: string; signInSubtitle: string; signInBtn: string; signingIn: string;
  createAccount: string; createAccountSubtitle: string; createAccountBtn: string; creatingAccount: string;
  emailLabel: string; passwordLabel: string; passwordHint: string; fullNameLabel: string;
  newHere: string; alreadyHaveAccount: string;
}

// ─── ENGLISH ────────────────────────────────────────────────────────────────────
const en: Translations = {
  appName: "Nyay-Sahayak", tagline: "AI-powered legal assistant for India", legalAI: "Legal AI",
  newConversation: "New Conversation", tools: "Tools", history: "History", settings: "Settings",
  emergency: "Emergency", logout: "Logout", adminPanel: "Admin Panel",
  inputLanguage: "Input Language", outputLanguage: "Output Language", voiceOutput: "Voice Output",
  readRepliesAloud: "Read AI replies aloud", simpleLanguage: "Simple Language",
  simpleLanguageDesc: "Explain without legal jargon",
  findNearestHelp: "Find Nearest Help", analyzeDocument: "Analyze Document",
  knowYourRights: "Know Your Rights", rtiApplication: "RTI Application",
  scanDocument: "Scan Document", legalNews: "Legal News", guidedLegalHelp: "Guided Legal Help",
  findLawyer: "Find a Lawyer", legalTemplates: "Legal Templates",
  caseStatusTracker: "Case Status Tracker", fileFirDraft: "File FIR Draft",
  dashboard: "My Dashboard", legalSearch: "Legal Search",
  typeYourMessage: "Ask your legal question…", pressEnterToSend: "Press Enter to send",
  askAnything: "Ask anything about Indian law — in your language",
  tapMicToSpeak: "Tap 🎤 to speak", stopGenerating: "Stop", shareWhatsApp: "Share on WhatsApp",
  disclaimer: "General legal information only — consult a qualified lawyer for specific advice",
  familyLaw: "Family Law", consumerRights: "Consumer Rights", propertyLaw: "Property Law", criminalLaw: "Criminal Law",
  continue: "Continue", back: "Back", close: "Close", save: "Save", upload: "Upload",
  delete: "Delete", edit: "Edit", cancel: "Cancel", confirm: "Confirm", generate: "Generate",
  download: "Download", search: "Search",
  fullName: "Full Name", age: "Age", gender: "Gender", contact: "Contact", email: "Email",
  address: "Address", city: "City", state: "State", district: "District", pincode: "Pincode",
  loading: "Loading…", success: "Success", error: "Error", tryAgain: "Try Again", noData: "No data available",
  section: "Section", act: "Act", court: "Court", lawyer: "Lawyer", case: "Case",
  petition: "Petition", evidence: "Evidence", witness: "Witness", complaint: "Complaint",
  firDraft: "FIR Draft", officialFormat: "Official Format · Form 24.1", policeStation: "Police Station",
  yourDetails: "Your Details", incidentEvidence: "Incident + Evidence",
  rtiTitle: "RTI Application", applicantDetails: "Applicant Details", informationSought: "Information Sought",
  youAreOffline: "You are offline", backOnline: "Back online", emergencyNumbers: "Emergency Numbers",
  offlineMessage: "Chat unavailable. Emergency contacts below.",
  chooseLanguage: "Choose your language", chooseLanguageDesc: "Select the language you are most comfortable with",
  continueIn: "Continue in",
  freeLegalAid: "Free Legal Aid Available", freeLegalAidDesc: "NALSA: 1800-110-370 · Tele-Law: 1800-120-1075",
  signIn: "Sign In", signInSubtitle: "Sign in to continue", signInBtn: "Sign In", signingIn: "Signing in…", createAccount: "Create Account", createAccountSubtitle: "Create your account", createAccountBtn: "Create Account", creatingAccount: "Creating account…", emailLabel: "Email", passwordLabel: "Password", passwordHint: "min 6 characters", fullNameLabel: "Full Name", newHere: "New here?", alreadyHaveAccount: "Already have an account?"
};

// ─── HINDI ────────────────────────────────────────────────────────────────────
const hi: Translations = {
  appName: "न्याय-सहायक", tagline: "भारत के लिए AI कानूनी सहायक", legalAI: "कानूनी AI",
  newConversation: "नई बातचीत", tools: "उपकरण", history: "इतिहास", settings: "सेटिंग्स",
  emergency: "आपातकाल", logout: "लॉग आउट", adminPanel: "एडमिन पैनल",
  inputLanguage: "इनपुट भाषा", outputLanguage: "आउटपुट भाषा", voiceOutput: "ध्वनि आउटपुट",
  readRepliesAloud: "AI उत्तर बोलकर सुनाएं", simpleLanguage: "सरल भाषा",
  simpleLanguageDesc: "कानूनी शब्दों के बिना समझाएं",
  findNearestHelp: "निकटतम सहायता खोजें", analyzeDocument: "दस्तावेज़ विश्लेषण",
  knowYourRights: "अपने अधिकार जानें", rtiApplication: "आरटीआई आवेदन",
  scanDocument: "दस्तावेज़ स्कैन", legalNews: "कानूनी समाचार", guidedLegalHelp: "मार्गदर्शित सहायता",
  findLawyer: "वकील खोजें", legalTemplates: "कानूनी टेम्प्लेट",
  caseStatusTracker: "केस स्थिति", fileFirDraft: "FIR ड्राफ्ट",
  dashboard: "मेरा डैशबोर्ड", legalSearch: "कानूनी खोज",
  typeYourMessage: "अपना कानूनी सवाल लिखें…", pressEnterToSend: "भेजने के लिए Enter दबाएं",
  askAnything: "भारतीय कानून के बारे में कुछ भी पूछें — अपनी भाषा में",
  tapMicToSpeak: "बोलने के लिए 🎤 दबाएं", stopGenerating: "रोकें", shareWhatsApp: "WhatsApp पर शेयर करें",
  disclaimer: "केवल सामान्य कानूनी जानकारी — विशेष सलाह के लिए वकील से मिलें",
  familyLaw: "पारिवारिक कानून", consumerRights: "उपभोक्ता अधिकार", propertyLaw: "संपत्ति कानून", criminalLaw: "आपराधिक कानून",
  continue: "जारी रखें", back: "वापस", close: "बंद करें", save: "सेव करें", upload: "अपलोड करें",
  delete: "मिटाएं", edit: "संपादित करें", cancel: "रद्द करें", confirm: "पुष्टि करें", generate: "बनाएं",
  download: "डाउनलोड", search: "खोजें",
  fullName: "पूरा नाम", age: "आयु", gender: "लिंग", contact: "संपर्क", email: "ईमेल",
  address: "पता", city: "शहर", state: "राज्य", district: "जिला", pincode: "पिनकोड",
  loading: "लोड हो रहा है…", success: "सफल", error: "त्रुटि", tryAgain: "फिर कोशिश करें", noData: "कोई डेटा नहीं",
  section: "धारा", act: "अधिनियम", court: "न्यायालय", lawyer: "वकील", case: "मामला",
  petition: "याचिका", evidence: "साक्ष्य", witness: "गवाह", complaint: "शिकायत",
  firDraft: "FIR ड्राफ्ट", officialFormat: "आधिकारिक प्रारूप · फॉर्म 24.1", policeStation: "पुलिस थाना",
  yourDetails: "आपका विवरण", incidentEvidence: "घटना + साक्ष्य",
  rtiTitle: "आरटीआई आवेदन", applicantDetails: "आवेदक विवरण", informationSought: "मांगी गई जानकारी",
  youAreOffline: "आप ऑफलाइन हैं", backOnline: "वापस ऑनलाइन", emergencyNumbers: "आपातकालीन नंबर",
  offlineMessage: "चैट उपलब्ध नहीं। नीचे आपातकालीन संपर्क देखें।",
  chooseLanguage: "अपनी भाषा चुनें", chooseLanguageDesc: "वह भाषा चुनें जिसमें आप सबसे सहज हों",
  continueIn: "में जारी रखें",
  freeLegalAid: "मुफ्त कानूनी सहायता उपलब्ध", freeLegalAidDesc: "NALSA: 1800-110-370 · टेली-लॉ: 1800-120-1075",
  signIn: "साइन इन करें", signInSubtitle: "जारी रखने के लिए साइन इन करें", signInBtn: "साइन इन", signingIn: "साइन इन हो रहे हैं…", createAccount: "अकाउंट बनाएं", createAccountSubtitle: "अपना अकाउंट बनाएं", createAccountBtn: "अकाउंट बनाएं", creatingAccount: "अकाउंट बन रहा है…", emailLabel: "ईमेल", passwordLabel: "पासवर्ड", passwordHint: "कम से कम 6 अक्षर", fullNameLabel: "पूरा नाम", newHere: "नए हैं?", alreadyHaveAccount: "पहले से अकाउंट है?"
};

// ─── BENGALI ──────────────────────────────────────────────────────────────────
const bn: Translations = {
  appName: "ন্যায়-সহায়ক", tagline: "ভারতের জন্য AI আইনি সহায়ক", legalAI: "আইনি AI",
  newConversation: "নতুন কথোপকথন", tools: "সরঞ্জাম", history: "ইতিহাস", settings: "সেটিংস",
  emergency: "জরুরি অবস্থা", logout: "লগ আউট", adminPanel: "অ্যাডমিন প্যানেল",
  inputLanguage: "ইনপুট ভাষা", outputLanguage: "আউটপুট ভাষা", voiceOutput: "ভয়েস আউটপুট",
  readRepliesAloud: "AI উত্তর জোরে পড়ুন", simpleLanguage: "সহজ ভাষা",
  simpleLanguageDesc: "আইনি পরিভাষা ছাড়া বোঝান",
  findNearestHelp: "নিকটতম সাহায্য খুঁজুন", analyzeDocument: "দলিল বিশ্লেষণ",
  knowYourRights: "আপনার অধিকার জানুন", rtiApplication: "আরটিআই আবেদন",
  scanDocument: "দলিল স্ক্যান", legalNews: "আইনি সংবাদ", guidedLegalHelp: "নির্দেশিত আইনি সাহায্য",
  findLawyer: "আইনজীবী খুঁজুন", legalTemplates: "আইনি টেমপ্লেট",
  caseStatusTracker: "মামলার অবস্থা", fileFirDraft: "FIR খসড়া",
  dashboard: "আমার ড্যাশবোর্ড", legalSearch: "আইনি অনুসন্ধান",
  typeYourMessage: "আপনার আইনি প্রশ্ন লিখুন…", pressEnterToSend: "পাঠাতে Enter চাপুন",
  askAnything: "ভারতীয় আইন সম্পর্কে যেকোনো প্রশ্ন করুন — আপনার ভাষায়",
  tapMicToSpeak: "কথা বলতে 🎤 চাপুন", stopGenerating: "থামুন", shareWhatsApp: "WhatsApp-এ শেয়ার করুন",
  disclaimer: "শুধুমাত্র সাধারণ আইনি তথ্য — নির্দিষ্ট পরামর্শের জন্য আইনজীবীর সাথে যোগাযোগ করুন",
  familyLaw: "পারিবারিক আইন", consumerRights: "ভোক্তা অধিকার", propertyLaw: "সম্পত্তি আইন", criminalLaw: "ফৌজদারি আইন",
  continue: "চালিয়ে যান", back: "পিছনে", close: "বন্ধ করুন", save: "সেভ করুন", upload: "আপলোড করুন",
  delete: "মুছুন", edit: "সম্পাদনা করুন", cancel: "বাতিল করুন", confirm: "নিশ্চিত করুন", generate: "তৈরি করুন",
  download: "ডাউনলোড", search: "অনুসন্ধান",
  fullName: "পুরো নাম", age: "বয়স", gender: "লিঙ্গ", contact: "যোগাযোগ", email: "ইমেল",
  address: "ঠিকানা", city: "শহর", state: "রাজ্য", district: "জেলা", pincode: "পিনকোড",
  loading: "লোড হচ্ছে…", success: "সফল", error: "ত্রুটি", tryAgain: "আবার চেষ্টা করুন", noData: "কোনো ডেটা নেই",
  section: "ধারা", act: "আইন", court: "আদালত", lawyer: "আইনজীবী", case: "মামলা",
  petition: "আবেদন", evidence: "প্রমাণ", witness: "সাক্ষী", complaint: "অভিযোগ",
  firDraft: "FIR খসড়া", officialFormat: "সরকারি ফর্ম্যাট · ফর্ম 24.1", policeStation: "পুলিশ স্টেশন",
  yourDetails: "আপনার বিবরণ", incidentEvidence: "ঘটনা + প্রমাণ",
  rtiTitle: "আরটিআই আবেদন", applicantDetails: "আবেদনকারীর বিবরণ", informationSought: "চাওয়া তথ্য",
  youAreOffline: "আপনি অফলাইনে আছেন", backOnline: "আবার অনলাইন", emergencyNumbers: "জরুরি নম্বর",
  offlineMessage: "চ্যাট অনুপলব্ধ। নিচে জরুরি যোগাযোগ দেখুন।",
  chooseLanguage: "আপনার ভাষা বেছে নিন", chooseLanguageDesc: "যে ভাষায় আপনি সবচেয়ে স্বাচ্ছন্দ্য বোধ করেন সেটি বেছে নিন",
  continueIn: "ভাষায় চালিয়ে যান",
  freeLegalAid: "বিনামূল্যে আইনি সহায়তা পাওয়া যাচ্ছে", freeLegalAidDesc: "NALSA: 1800-110-370 · টেলি-ল: 1800-120-1075",
  signIn: "সাইন ইন করুন", signInSubtitle: "চালিয়ে যেতে সাইন ইন করুন", signInBtn: "সাইন ইন", signingIn: "সাইন ইন হচ্ছে…", createAccount: "অ্যাকাউন্ট তৈরি করুন", createAccountSubtitle: "আপনার অ্যাকাউন্ট তৈরি করুন", createAccountBtn: "অ্যাকাউন্ট তৈরি করুন", creatingAccount: "অ্যাকাউন্ট তৈরি হচ্ছে…", emailLabel: "ইমেল", passwordLabel: "পাসওয়ার্ড", passwordHint: "কমপক্ষে ৬ অক্ষর", fullNameLabel: "পুরো নাম", newHere: "নতুন এখানে?", alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?"
};

// ─── TELUGU ──────────────────────────────────────────────────────────────────
const te: Translations = {
  appName: "న్యాయ్-సహాయక్", tagline: "భారతదేశానికి AI న్యాయ సహాయకుడు", legalAI: "న్యాయ AI",
  newConversation: "కొత్త సంభాషణ", tools: "సాధనాలు", history: "చరిత్ర", settings: "సెట్టింగ్‌లు",
  emergency: "అత్యవసర పరిస్థితి", logout: "లాగ్ అవుట్", adminPanel: "అడ్మిన్ ప్యానెల్",
  inputLanguage: "ఇన్‌పుట్ భాష", outputLanguage: "అవుట్‌పుట్ భాష", voiceOutput: "వాయిస్ అవుట్‌పుట్",
  readRepliesAloud: "AI సమాధానాలు చదివి వినిపించు", simpleLanguage: "సరళమైన భాష",
  simpleLanguageDesc: "న్యాయ పరిభాష లేకుండా వివరించు",
  findNearestHelp: "సమీప సహాయం కనుగొనండి", analyzeDocument: "పత్రం విశ్లేషణ",
  knowYourRights: "మీ హక్కులు తెలుసుకోండి", rtiApplication: "RTI దరఖాస్తు",
  scanDocument: "పత్రం స్కాన్ చేయండి", legalNews: "న్యాయ వార్తలు", guidedLegalHelp: "మార్గనిర్దేశిత సహాయం",
  findLawyer: "న్యాయవాదిని కనుగొనండి", legalTemplates: "న్యాయ టెంప్లేట్లు",
  caseStatusTracker: "కేసు స్థితి", fileFirDraft: "FIR డ్రాఫ్ట్",
  dashboard: "నా డాష్‌బోర్డ్", legalSearch: "న్యాయ శోధన",
  typeYourMessage: "మీ న్యాయ ప్రశ్న టైప్ చేయండి…", pressEnterToSend: "పంపడానికి Enter నొక్కండి",
  askAnything: "భారతీయ చట్టం గురించి ఏదైనా అడగండి — మీ భాషలో",
  tapMicToSpeak: "మాట్లాడటానికి 🎤 నొక్కండి", stopGenerating: "ఆపు", shareWhatsApp: "WhatsApp లో షేర్ చేయండి",
  disclaimer: "సాధారణ న్యాయ సమాచారం మాత్రమే — నిర్దిష్ట సలహాకు న్యాయవాదిని సంప్రదించండి",
  familyLaw: "కుటుంబ చట్టం", consumerRights: "వినియోగదారు హక్కులు", propertyLaw: "ఆస్తి చట్టం", criminalLaw: "నేర చట్టం",
  continue: "కొనసాగించు", back: "వెనుకకు", close: "మూసివేయి", save: "సేవ్ చేయి", upload: "అప్‌లోడ్ చేయి",
  delete: "తొలగించు", edit: "సవరించు", cancel: "రద్దు చేయి", confirm: "నిర్ధారించు", generate: "రూపొందించు",
  download: "డౌన్‌లోడ్", search: "శోధించు",
  fullName: "పూర్తి పేరు", age: "వయస్సు", gender: "లింగం", contact: "సంప్రదింపు", email: "ఇమెయిల్",
  address: "చిరునామా", city: "నగరం", state: "రాష్ట్రం", district: "జిల్లా", pincode: "పిన్‌కోడ్",
  loading: "లోడ్ అవుతోంది…", success: "విజయం", error: "లోపం", tryAgain: "మళ్ళీ ప్రయత్నించండి", noData: "డేటా అందుబాటులో లేదు",
  section: "సెక్షన్", act: "చట్టం", court: "న్యాయస్థానం", lawyer: "న్యాయవాది", case: "కేసు",
  petition: "పిటిషన్", evidence: "సాక్ష్యం", witness: "సాక్షి", complaint: "ఫిర్యాదు",
  firDraft: "FIR డ్రాఫ్ట్", officialFormat: "అధికారిక ఫార్మాట్ · ఫారం 24.1", policeStation: "పోలీస్ స్టేషన్",
  yourDetails: "మీ వివరాలు", incidentEvidence: "సంఘటన + సాక్ష్యం",
  rtiTitle: "RTI దరఖాస్తు", applicantDetails: "దరఖాస్తుదారు వివరాలు", informationSought: "కోరిన సమాచారం",
  youAreOffline: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు", backOnline: "తిరిగి ఆన్‌లైన్", emergencyNumbers: "అత్యవసర నంబర్లు",
  offlineMessage: "చాట్ అందుబాటులో లేదు. దిగువన అత్యవసర సంప్రదింపులు చూడండి.",
  chooseLanguage: "మీ భాష ఎంచుకోండి", chooseLanguageDesc: "మీకు అత్యంత సౌకర్యంగా అనిపించే భాష ఎంచుకోండి",
  continueIn: "లో కొనసాగించు",
  freeLegalAid: "ఉచిత న్యాయ సహాయం అందుబాటులో ఉంది", freeLegalAidDesc: "NALSA: 1800-110-370 · టెలి-లా: 1800-120-1075",
  signIn: "సైన్ ఇన్ చేయండి", signInSubtitle: "కొనసాగించడానికి సైన్ ఇన్ చేయండి", signInBtn: "సైన్ ఇన్", signingIn: "సైన్ ఇన్ అవుతోంది…", createAccount: "అకౌంట్ సృష్టించండి", createAccountSubtitle: "మీ అకౌంట్ సృష్టించండి", createAccountBtn: "అకౌంట్ సృష్టించండి", creatingAccount: "అకౌంట్ సృష్టిస్తోంది…", emailLabel: "ఇమెయిల్", passwordLabel: "పాస్‌వర్డ్", passwordHint: "కనీసం 6 అక్షరాలు", fullNameLabel: "పూర్తి పేరు", newHere: "కొత్తవారా?", alreadyHaveAccount: "ఇప్పటికే అకౌంట్ ఉందా?"
};

// ─── TAMIL ────────────────────────────────────────────────────────────────────
const ta: Translations = {
  appName: "நீதி-உதவியாளர்", tagline: "இந்தியாவிற்கான AI சட்ட உதவியாளர்", legalAI: "சட்ட AI",
  newConversation: "புதிய உரையாடல்", tools: "கருவிகள்", history: "வரலாறு", settings: "அமைப்புகள்",
  emergency: "அவசரநிலை", logout: "வெளியேறு", adminPanel: "நிர்வாக பலகை",
  inputLanguage: "உள்ளீட்டு மொழி", outputLanguage: "வெளியீட்டு மொழி", voiceOutput: "குரல் வெளியீடு",
  readRepliesAloud: "AI பதில்களை声 சத்தமாக படி", simpleLanguage: "எளிய மொழி",
  simpleLanguageDesc: "சட்ட வார்த்தைகள் இல்லாமல் விளக்கு",
  findNearestHelp: "அருகிலுள்ள உதவியைக் கண்டறி", analyzeDocument: "ஆவண பகுப்பாய்வு",
  knowYourRights: "உங்கள் உரிமைகளை அறிந்துகொள்ளுங்கள்", rtiApplication: "RTI விண்ணப்பம்",
  scanDocument: "ஆவணத்தை ஸ்கேன் செய்", legalNews: "சட்ட செய்திகள்", guidedLegalHelp: "வழிகாட்டப்பட்ட உதவி",
  findLawyer: "வழக்கறிஞரைக் கண்டறி", legalTemplates: "சட்ட வார்ப்புருக்கள்",
  caseStatusTracker: "வழக்கு நிலை", fileFirDraft: "FIR வரைவு",
  dashboard: "என் டாஷ்போர்டு", legalSearch: "சட்ட தேடல்",
  typeYourMessage: "உங்கள் சட்டக் கேள்வியை தட்டச்சு செய்யுங்கள்…", pressEnterToSend: "அனுப்ப Enter அழுத்துங்கள்",
  askAnything: "இந்திய சட்டத்தைப் பற்றி எதையும் கேளுங்கள் — உங்கள் மொழியில்",
  tapMicToSpeak: "பேச 🎤 தட்டுங்கள்", stopGenerating: "நிறுத்து", shareWhatsApp: "WhatsApp-ல் பகிர்",
  disclaimer: "பொதுவான சட்டத் தகவல் மட்டுமே — குறிப்பிட்ட ஆலோசனைக்கு வழக்கறிஞரை அணுகவும்",
  familyLaw: "குடும்ப சட்டம்", consumerRights: "நுகர்வோர் உரிமைகள்", propertyLaw: "சொத்து சட்டம்", criminalLaw: "குற்றவியல் சட்டம்",
  continue: "தொடரவும்", back: "பின்செல்", close: "மூடு", save: "சேமி", upload: "பதிவேற்று",
  delete: "நீக்கு", edit: "திருத்து", cancel: "ரத்துசெய்", confirm: "உறுதிப்படுத்து", generate: "உருவாக்கு",
  download: "பதிவிறக்கு", search: "தேடு",
  fullName: "முழு பெயர்", age: "வயது", gender: "பாலினம்", contact: "தொடர்பு", email: "மின்னஞ்சல்",
  address: "முகவரி", city: "நகரம்", state: "மாநிலம்", district: "மாவட்டம்", pincode: "பின்கோடு",
  loading: "ஏற்றுகிறது…", success: "வெற்றி", error: "பிழை", tryAgain: "மீண்டும் முயற்சி", noData: "தரவு இல்லை",
  section: "பிரிவு", act: "சட்டம்", court: "நீதிமன்றம்", lawyer: "வழக்கறிஞர்", case: "வழக்கு",
  petition: "மனு", evidence: "சான்று", witness: "சாட்சி", complaint: "புகார்",
  firDraft: "FIR வரைவு", officialFormat: "அதிகாரப்பூர்வ வடிவம் · படிவம் 24.1", policeStation: "காவல் நிலையம்",
  yourDetails: "உங்கள் விவரங்கள்", incidentEvidence: "சம்பவம் + சான்று",
  rtiTitle: "RTI விண்ணப்பம்", applicantDetails: "விண்ணப்பதாரர் விவரங்கள்", informationSought: "கோரப்பட்ட தகவல்",
  youAreOffline: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்", backOnline: "மீண்டும் ஆன்லைன்", emergencyNumbers: "அவசர எண்கள்",
  offlineMessage: "அரட்டை கிடைக்கவில்லை. கீழே அவசர தொடர்புகளைப் பார்க்கவும்.",
  chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுங்கள்", chooseLanguageDesc: "நீங்கள் மிகவும் வசதியாக இருக்கும் மொழியைத் தேர்ந்தெடுங்கள்",
  continueIn: "மொழியில் தொடரவும்",
  freeLegalAid: "இலவச சட்ட உதவி கிடைக்கிறது", freeLegalAidDesc: "NALSA: 1800-110-370 · டெலி-சட்டம்: 1800-120-1075",
  signIn: "உள்நுழைக", signInSubtitle: "தொடர உள்நுழைக", signInBtn: "உள்நுழை", signingIn: "உள்நுழைகிறது…", createAccount: "கணக்கு உருவாக்கு", createAccountSubtitle: "உங்கள் கணக்கை உருவாக்கு", createAccountBtn: "கணக்கு உருவாக்கு", creatingAccount: "கணக்கு உருவாக்கப்படுகிறது…", emailLabel: "மின்னஞ்சல்", passwordLabel: "கடவுச்சொல்", passwordHint: "குறைந்தது 6 எழுத்துகள்", fullNameLabel: "முழு பெயர்", newHere: "புதியவரா?", alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?"
};

// ─── MARATHI ─────────────────────────────────────────────────────────────────
const mr: Translations = {
  appName: "न्याय-सहायक", tagline: "भारतासाठी AI कायदेशीर सहाय्यक", legalAI: "कायदेशीर AI",
  newConversation: "नवीन संभाषण", tools: "साधने", history: "इतिहास", settings: "सेटिंग्ज",
  emergency: "आणीबाणी", logout: "लॉग आउट", adminPanel: "प्रशासन पॅनेल",
  inputLanguage: "इनपुट भाषा", outputLanguage: "आउटपुट भाषा", voiceOutput: "आवाज आउटपुट",
  readRepliesAloud: "AI उत्तरे मोठ्याने वाचा", simpleLanguage: "सोपी भाषा",
  simpleLanguageDesc: "कायदेशीर शब्दांशिवाय समजावून सांगा",
  findNearestHelp: "जवळची मदत शोधा", analyzeDocument: "कागदपत्र विश्लेषण",
  knowYourRights: "तुमचे हक्क जाणून घ्या", rtiApplication: "आरटीआय अर्ज",
  scanDocument: "कागदपत्र स्कॅन करा", legalNews: "कायदेशीर बातम्या", guidedLegalHelp: "मार्गदर्शित मदत",
  findLawyer: "वकील शोधा", legalTemplates: "कायदेशीर टेम्प्लेट",
  caseStatusTracker: "खटल्याची स्थिती", fileFirDraft: "FIR मसुदा",
  dashboard: "माझा डॅशबोर्ड", legalSearch: "कायदेशीर शोध",
  typeYourMessage: "तुमचा कायदेशीर प्रश्न टाइप करा…", pressEnterToSend: "पाठवण्यासाठी Enter दाबा",
  askAnything: "भारतीय कायद्याबद्दल काहीही विचारा — तुमच्या भाषेत",
  tapMicToSpeak: "बोलण्यासाठी 🎤 दाबा", stopGenerating: "थांबा", shareWhatsApp: "WhatsApp वर शेअर करा",
  disclaimer: "केवळ सामान्य कायदेशीर माहिती — विशिष्ट सल्ल्यासाठी वकिलाशी संपर्क साधा",
  familyLaw: "कौटुंबिक कायदा", consumerRights: "ग्राहक हक्क", propertyLaw: "मालमत्ता कायदा", criminalLaw: "फौजदारी कायदा",
  continue: "सुरू ठेवा", back: "मागे", close: "बंद करा", save: "जतन करा", upload: "अपलोड करा",
  delete: "हटवा", edit: "संपादित करा", cancel: "रद्द करा", confirm: "पुष्टी करा", generate: "तयार करा",
  download: "डाउनलोड", search: "शोधा",
  fullName: "पूर्ण नाव", age: "वय", gender: "लिंग", contact: "संपर्क", email: "ईमेल",
  address: "पत्ता", city: "शहर", state: "राज्य", district: "जिल्हा", pincode: "पिनकोड",
  loading: "लोड होत आहे…", success: "यशस्वी", error: "त्रुटी", tryAgain: "पुन्हा प्रयत्न करा", noData: "डेटा उपलब्ध नाही",
  section: "कलम", act: "कायदा", court: "न्यायालय", lawyer: "वकील", case: "खटला",
  petition: "याचिका", evidence: "पुरावा", witness: "साक्षीदार", complaint: "तक्रार",
  firDraft: "FIR मसुदा", officialFormat: "अधिकृत स्वरूप · फॉर्म 24.1", policeStation: "पोलीस ठाणे",
  yourDetails: "तुमचा तपशील", incidentEvidence: "घटना + पुरावा",
  rtiTitle: "आरटीआय अर्ज", applicantDetails: "अर्जदाराचा तपशील", informationSought: "मागितलेली माहिती",
  youAreOffline: "तुम्ही ऑफलाइन आहात", backOnline: "पुन्हा ऑनलाइन", emergencyNumbers: "आणीबाणी क्रमांक",
  offlineMessage: "चॅट उपलब्ध नाही. खाली आणीबाणी संपर्क पहा.",
  chooseLanguage: "तुमची भाषा निवडा", chooseLanguageDesc: "तुम्हाला सर्वात सोयीस्कर वाटणारी भाषा निवडा",
  continueIn: "मध्ये सुरू ठेवा",
  freeLegalAid: "मोफत कायदेशीर मदत उपलब्ध", freeLegalAidDesc: "NALSA: 1800-110-370 · टेली-लॉ: 1800-120-1075",
  signIn: "साइन इन करा", signInSubtitle: "सुरू ठेवण्यासाठी साइन इन करा", signInBtn: "साइन इन", signingIn: "साइन इन होत आहे…", createAccount: "खाते तयार करा", createAccountSubtitle: "तुमचे खाते तयार करा", createAccountBtn: "खाते तयार करा", creatingAccount: "खाते तयार होत आहे…", emailLabel: "ईमेल", passwordLabel: "पासवर्ड", passwordHint: "किमान ६ अक्षरे", fullNameLabel: "पूर्ण नाव", newHere: "नवीन आहात?", alreadyHaveAccount: "आधीच खाते आहे?"
};

// ─── GUJARATI ────────────────────────────────────────────────────────────────
const gu: Translations = {
  appName: "ન્યાય-સહાયક", tagline: "ભારત માટે AI કાનૂની સહાયક", legalAI: "કાનૂની AI",
  newConversation: "નવી વાતચીત", tools: "સાધનો", history: "ઇતિહાસ", settings: "સેટિંગ્સ",
  emergency: "કટોકટી", logout: "લૉગ આઉટ", adminPanel: "એડમિન પૅનલ",
  inputLanguage: "ઇનપુટ ભાષા", outputLanguage: "આઉટપુટ ભાષા", voiceOutput: "અવાજ આઉટપુટ",
  readRepliesAloud: "AI જવાબો મોટેથી વાંચો", simpleLanguage: "સરળ ભાષા",
  simpleLanguageDesc: "કાનૂની શબ્દો વિના સમજાવો",
  findNearestHelp: "નજીકની મદદ શોધો", analyzeDocument: "દસ્તાવેજ વિશ્લેષણ",
  knowYourRights: "તમારા અધિકારો જાણો", rtiApplication: "RTI અરજી",
  scanDocument: "દસ્તાવેજ સ્કેન", legalNews: "કાનૂની સમાચાર", guidedLegalHelp: "માર્ગદર્શિત સહાય",
  findLawyer: "વકીલ શોધો", legalTemplates: "કાનૂની ટેમ્પ્લેટ",
  caseStatusTracker: "કેસ સ્થિતિ", fileFirDraft: "FIR ડ્રાફ્ટ",
  dashboard: "મારું ડૅશબોર્ડ", legalSearch: "કાનૂની શોધ",
  typeYourMessage: "તમારો કાનૂની પ્રશ્ન ટાઇપ કરો…", pressEnterToSend: "મોકલવા Enter દબાવો",
  askAnything: "ભારતીય કાયદા વિશે ગમે તે પૂછો — તમારી ભાષામાં",
  tapMicToSpeak: "બોલવા 🎤 દબાવો", stopGenerating: "રોકો", shareWhatsApp: "WhatsApp પર શેર કરો",
  disclaimer: "ફક્ત સામાન્ય કાનૂની માહિતી — ચોક્કસ સલાહ માટે વકીલ પાસે જાઓ",
  familyLaw: "કૌટુંબિક કાયદો", consumerRights: "ગ્રાહક અધિકારો", propertyLaw: "મિલ્કત કાયદો", criminalLaw: "ફોજદારી કાયદો",
  continue: "ચાલુ રાખો", back: "પાછળ", close: "બંધ કરો", save: "સેવ કરો", upload: "અપલોડ",
  delete: "કાઢો", edit: "સંપાદિત કરો", cancel: "રદ કરો", confirm: "પુષ્ટિ કરો", generate: "બનાવો",
  download: "ડાઉનલોડ", search: "શોધો",
  fullName: "પૂરું નામ", age: "ઉંમર", gender: "લિંગ", contact: "સંપર્ક", email: "ઇમેઇલ",
  address: "સરનામું", city: "શહેર", state: "રાજ્ય", district: "જિલ્લો", pincode: "પિનકોડ",
  loading: "લોડ થઈ રહ્યું છે…", success: "સફળ", error: "ભૂલ", tryAgain: "ફરી પ્રયાસ", noData: "ડેટા ઉપલબ્ધ નથી",
  section: "કલમ", act: "અધિનિયમ", court: "ન્યાયાલય", lawyer: "વકીલ", case: "કેસ",
  petition: "અરજી", evidence: "પુરાવો", witness: "સાક્ષી", complaint: "ફરિયાદ",
  firDraft: "FIR ડ્રાફ્ટ", officialFormat: "સત્તાવાર ફોર્મેટ · ફૉર્મ 24.1", policeStation: "પોલીસ સ્ટેશન",
  yourDetails: "તમારી વિગતો", incidentEvidence: "ઘટના + પુરાવો",
  rtiTitle: "RTI અરજી", applicantDetails: "અરજદારની વિગતો", informationSought: "માગેલી માહિતી",
  youAreOffline: "તમે ઑફલાઇન છો", backOnline: "ફરી ઑનલાઇન", emergencyNumbers: "ઇમર્જન્સી નંબર",
  offlineMessage: "ચૅટ ઉપલબ્ધ નથી. નીચે ઇમર્જન્સી સંપર્ક જુઓ.",
  chooseLanguage: "તમારી ભાષા પસંદ કરો", chooseLanguageDesc: "તમને સૌથી આરામદાયક લાગે એ ભાષા પસંદ કરો",
  continueIn: "માં ચાલુ રાખો",
  freeLegalAid: "મફત કાનૂની સહાય ઉપલબ્ધ", freeLegalAidDesc: "NALSA: 1800-110-370 · ટેલી-લૉ: 1800-120-1075",
  signIn: "સાઇન ઇન કરો", signInSubtitle: "ચાલુ રાખવા સાઇન ઇન કરો", signInBtn: "સાઇન ઇન", signingIn: "સાઇન ઇન થઈ રહ્યું છે…", createAccount: "ખાતું બનાવો", createAccountSubtitle: "તમારું ખાતું બનાવો", createAccountBtn: "ખાતું બનાવો", creatingAccount: "ખાતું બનાવાઈ રહ્યું છે…", emailLabel: "ઇમેઇલ", passwordLabel: "પાસવર્ડ", passwordHint: "ઓછામાં ઓછા ૬ અક્ષરો", fullNameLabel: "પૂરું નામ", newHere: "નવા છો?", alreadyHaveAccount: "પહેલેથી ખાતું છે?"
};

// ─── KANNADA ─────────────────────────────────────────────────────────────────
const kn: Translations = {
  appName: "ನ್ಯಾಯ-ಸಹಾಯಕ", tagline: "ಭಾರತಕ್ಕಾಗಿ AI ಕಾನೂನು ಸಹಾಯಕ", legalAI: "ಕಾನೂನು AI",
  newConversation: "ಹೊಸ ಸಂಭಾಷಣೆ", tools: "ಸಾಧನಗಳು", history: "ಇತಿಹಾಸ", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
  emergency: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ", logout: "ಲಾಗ್ ಔಟ್", adminPanel: "ಆಡಳಿತ ಫಲಕ",
  inputLanguage: "ಇನ್‌ಪುಟ್ ಭಾಷೆ", outputLanguage: "ಔಟ್‌ಪುಟ್ ಭಾಷೆ", voiceOutput: "ಧ್ವನಿ ಔಟ್‌ಪುಟ್",
  readRepliesAloud: "AI ಉತ್ತರಗಳನ್ನು ಜೋರಾಗಿ ಓದಿ", simpleLanguage: "ಸರಳ ಭಾಷೆ",
  simpleLanguageDesc: "ಕಾನೂನು ಪರಿಭಾಷೆ ಇಲ್ಲದೆ ವಿವರಿಸಿ",
  findNearestHelp: "ಹತ್ತಿರದ ಸಹಾಯ ಹುಡುಕಿ", analyzeDocument: "ದಾಖಲೆ ವಿಶ್ಲೇಷಣೆ",
  knowYourRights: "ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ", rtiApplication: "RTI ಅರ್ಜಿ",
  scanDocument: "ದಾಖಲೆ ಸ್ಕ್ಯಾನ್", legalNews: "ಕಾನೂನು ಸುದ್ದಿ", guidedLegalHelp: "ಮಾರ್ಗದರ್ಶಿ ಸಹಾಯ",
  findLawyer: "ವಕೀಲರನ್ನು ಹುಡುಕಿ", legalTemplates: "ಕಾನೂನು ಟೆಂಪ್ಲೇಟ್‌ಗಳು",
  caseStatusTracker: "ಪ್ರಕರಣ ಸ್ಥಿತಿ", fileFirDraft: "FIR ಕರಡು",
  dashboard: "ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", legalSearch: "ಕಾನೂನು ಹುಡುಕಾಟ",
  typeYourMessage: "ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ…", pressEnterToSend: "ಕಳುಹಿಸಲು Enter ಒತ್ತಿ",
  askAnything: "ಭಾರತೀಯ ಕಾನೂನಿನ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ — ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ",
  tapMicToSpeak: "ಮಾತನಾಡಲು 🎤 ಒತ್ತಿ", stopGenerating: "ನಿಲ್ಲಿಸಿ", shareWhatsApp: "WhatsApp ನಲ್ಲಿ ಹಂಚಿ",
  disclaimer: "ಸಾಮಾನ್ಯ ಕಾನೂನು ಮಾಹಿತಿ ಮಾತ್ರ — ನಿರ್ದಿಷ್ಟ ಸಲಹೆಗೆ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ",
  familyLaw: "ಕೌಟುಂಬಿಕ ಕಾನೂನು", consumerRights: "ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು", propertyLaw: "ಆಸ್ತಿ ಕಾನೂನು", criminalLaw: "ಕ್ರಿಮಿನಲ್ ಕಾನೂನು",
  continue: "ಮುಂದುವರಿಸಿ", back: "ಹಿಂದೆ", close: "ಮುಚ್ಚಿ", save: "ಉಳಿಸಿ", upload: "ಅಪ್‌ಲೋಡ್",
  delete: "ಅಳಿಸಿ", edit: "ಸಂಪಾದಿಸಿ", cancel: "ರದ್ದುಮಾಡಿ", confirm: "ದೃಢಪಡಿಸಿ", generate: "ರಚಿಸಿ",
  download: "ಡೌನ್‌ಲೋಡ್", search: "ಹುಡುಕಿ",
  fullName: "ಪೂರ್ಣ ಹೆಸರು", age: "ವಯಸ್ಸು", gender: "ಲಿಂಗ", contact: "ಸಂಪರ್ಕ", email: "ಇಮೇಲ್",
  address: "ವಿಳಾಸ", city: "ನಗರ", state: "ರಾಜ್ಯ", district: "ಜಿಲ್ಲೆ", pincode: "ಪಿನ್‌ಕೋಡ್",
  loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…", success: "ಯಶಸ್ಸು", error: "ದೋಷ", tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", noData: "ಡೇಟಾ ಇಲ್ಲ",
  section: "ಸೆಕ್ಷನ್", act: "ಕಾಯ್ದೆ", court: "ನ್ಯಾಯಾಲಯ", lawyer: "ವಕೀಲ", case: "ಪ್ರಕರಣ",
  petition: "ಅರ್ಜಿ", evidence: "ಪುರಾವೆ", witness: "ಸಾಕ್ಷಿ", complaint: "ದೂರು",
  firDraft: "FIR ಕರಡು", officialFormat: "ಅಧಿಕೃತ ಸ್ವರೂಪ · ಫಾರ್ಮ್ 24.1", policeStation: "ಪೊಲೀಸ್ ಠಾಣೆ",
  yourDetails: "ನಿಮ್ಮ ವಿವರಗಳು", incidentEvidence: "ಘಟನೆ + ಪುರಾವೆ",
  rtiTitle: "RTI ಅರ್ಜಿ", applicantDetails: "ಅರ್ಜಿದಾರರ ವಿವರಗಳು", informationSought: "ಕೋರಿದ ಮಾಹಿತಿ",
  youAreOffline: "ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ", backOnline: "ಮತ್ತೆ ಆನ್‌ಲೈನ್", emergencyNumbers: "ತುರ್ತು ಸಂಖ್ಯೆಗಳು",
  offlineMessage: "ಚಾಟ್ ಲಭ್ಯವಿಲ್ಲ. ಕೆಳಗೆ ತುರ್ತು ಸಂಪರ್ಕಗಳನ್ನು ನೋಡಿ.",
  chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ", chooseLanguageDesc: "ನಿಮಗೆ ಹೆಚ್ಚು ಅನುಕೂಲಕರ ಭಾಷೆಯನ್ನು ಆರಿಸಿ",
  continueIn: "ನಲ್ಲಿ ಮುಂದುವರಿಸಿ",
  freeLegalAid: "ಉಚಿತ ಕಾನೂನು ಸಹಾಯ ಲಭ್ಯ", freeLegalAidDesc: "NALSA: 1800-110-370 · ಟೆಲಿ-ಲಾ: 1800-120-1075",
  signIn: "ಸೈನ್ ಇನ್ ಮಾಡಿ", signInSubtitle: "ಮುಂದುವರಿಯಲು ಸೈನ್ ಇನ್ ಮಾಡಿ", signInBtn: "ಸೈನ್ ಇನ್", signingIn: "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ…", createAccount: "ಖಾತೆ ರಚಿಸಿ", createAccountSubtitle: "ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ", createAccountBtn: "ಖಾತೆ ರಚಿಸಿ", creatingAccount: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ…", emailLabel: "ಇಮೇಲ್", passwordLabel: "ಪಾಸ್‌ವರ್ಡ್", passwordHint: "ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು", fullNameLabel: "ಪೂರ್ಣ ಹೆಸರು", newHere: "ಹೊಸದಾ?", alreadyHaveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?"
};

// ─── MALAYALAM ───────────────────────────────────────────────────────────────
const ml: Translations = {
  appName: "ന്യായ്-സഹായക്", tagline: "ഇന്ത്യക്കുവേണ്ടി AI നിയമ സഹായി", legalAI: "നിയമ AI",
  newConversation: "പുതിയ സംഭാഷണം", tools: "ഉപകരണങ്ങൾ", history: "ചരിത്രം", settings: "ക്രമീകരണങ്ങൾ",
  emergency: "അടിയന്തരാവസ്ഥ", logout: "ലോഗ് ഔട്ട്", adminPanel: "അഡ്മിൻ പാനൽ",
  inputLanguage: "ഇൻപുട്ട് ഭാഷ", outputLanguage: "ഔട്ട്പുട്ട് ഭാഷ", voiceOutput: "ശബ്ദ ഔട്ട്പുട്ട്",
  readRepliesAloud: "AI മറുപടികൾ声 ഉച്ചത്തിൽ വായിക്കുക", simpleLanguage: "ലളിത ഭാഷ",
  simpleLanguageDesc: "നിയമ ഭാഷ കൂടാതെ വിശദീകരിക്കുക",
  findNearestHelp: "അടുത്ത സഹായം കണ്ടെത്തുക", analyzeDocument: "രേഖ വിശകലനം",
  knowYourRights: "നിങ്ങളുടെ അവകാശങ്ങൾ അറിയുക", rtiApplication: "RTI അപേക്ഷ",
  scanDocument: "രേഖ സ്കാൻ ചെയ്യുക", legalNews: "നിയമ വാർത്തകൾ", guidedLegalHelp: "വഴിനടത്തൽ സഹായം",
  findLawyer: "അഭിഭാഷകനെ കണ്ടെത്തുക", legalTemplates: "നിയമ ടെംപ്ലേറ്റുകൾ",
  caseStatusTracker: "കേസ് സ്ഥിതി", fileFirDraft: "FIR ഡ്രാഫ്റ്റ്",
  dashboard: "എന്റെ ഡാഷ്ബോർഡ്", legalSearch: "നിയമ തിരയൽ",
  typeYourMessage: "നിങ്ങളുടെ നിയമ ചോദ്യം ടൈപ്പ് ചെയ്യുക…", pressEnterToSend: "അയക്കാൻ Enter അമർത്തുക",
  askAnything: "ഇന്ത്യൻ നിയമത്തെക്കുറിച്ച് എന്തും ചോദിക്കുക — നിങ്ങളുടെ ഭാഷയിൽ",
  tapMicToSpeak: "സംസാരിക്കാൻ 🎤 അമർത്തുക", stopGenerating: "നിർത്തുക", shareWhatsApp: "WhatsApp-ൽ പങ്കിടുക",
  disclaimer: "പൊതു നിയമ വിവരങ്ങൾ മാത്രം — പ്രത്യേക ഉപദേശത്തിന് അഭിഭാഷകനെ സമീപിക്കുക",
  familyLaw: "കുടുംബ നിയമം", consumerRights: "ഉപഭോക്തൃ അവകാശങ്ങൾ", propertyLaw: "സ്വത്ത് നിയമം", criminalLaw: "ക്രിമിനൽ നിയമം",
  continue: "തുടരുക", back: "പിന്നോട്ട്", close: "അടയ്ക്കുക", save: "സേവ് ചെയ്യുക", upload: "അപ്‌ലോഡ് ചെയ്യുക",
  delete: "ഇല്ലാതാക്കുക", edit: "തിരുത്തുക", cancel: "റദ്ദാക്കുക", confirm: "സ്ഥിരീകരിക്കുക", generate: "സൃഷ്ടിക്കുക",
  download: "ഡൗൺലോഡ്", search: "തിരയുക",
  fullName: "പൂർണ്ണ നാമം", age: "പ്രായം", gender: "ലിംഗം", contact: "ബന്ധപ്പെടൽ", email: "ഇ-മെയിൽ",
  address: "വിലാസം", city: "നഗരം", state: "സംസ്ഥാനം", district: "ജില്ല", pincode: "പിൻകോഡ്",
  loading: "ലോഡ് ചെയ്യുന്നു…", success: "വിജയം", error: "പിശക്", tryAgain: "വീണ്ടും ശ്രമിക്കുക", noData: "ഡേറ്റ ലഭ്യമല്ല",
  section: "വകുപ്പ്", act: "ആക്ട്", court: "കോടതി", lawyer: "അഭിഭാഷകൻ", case: "കേസ്",
  petition: "ഹർജി", evidence: "തെളിവ്", witness: "സാക്ഷി", complaint: "പരാതി",
  firDraft: "FIR ഡ്രാഫ്റ്റ്", officialFormat: "ഔദ്യോഗിക ഫോർമാറ്റ് · ഫോം 24.1", policeStation: "പോലീസ് സ്റ്റേഷൻ",
  yourDetails: "നിങ്ങളുടെ വിവരങ്ങൾ", incidentEvidence: "സംഭവം + തെളിവ്",
  rtiTitle: "RTI അപേക്ഷ", applicantDetails: "അപേക്ഷകന്റെ വിവരങ്ങൾ", informationSought: "ആവശ്യമുള്ള വിവരം",
  youAreOffline: "നിങ്ങൾ ഓഫ്‌ലൈനിലാണ്", backOnline: "വീണ്ടും ഓൺലൈൻ", emergencyNumbers: "അടിയന്തര നമ്പറുകൾ",
  offlineMessage: "ചാറ്റ് ലഭ്യമല്ല. താഴെ അടിയന്തര ബന്ധങ്ങൾ കാണുക.",
  chooseLanguage: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക", chooseLanguageDesc: "നിങ്ങൾക്ക് ഏറ്റവും സൗകര്യപ്രദമായ ഭാഷ തിരഞ്ഞെടുക്കുക",
  continueIn: "ൽ തുടരുക",
  freeLegalAid: "സൗജന്യ നിയമ സഹായം ലഭ്യം", freeLegalAidDesc: "NALSA: 1800-110-370 · ടെലി-ലോ: 1800-120-1075",
  signIn: "സൈൻ ഇൻ ചെയ്യുക", signInSubtitle: "തുടരാൻ സൈൻ ഇൻ ചെയ്യുക", signInBtn: "സൈൻ ഇൻ", signingIn: "സൈൻ ഇൻ ആകുന്നു…", createAccount: "അക്കൗണ്ട് ഉണ്ടാക്കുക", createAccountSubtitle: "നിങ്ങളുടെ അക്കൗണ്ട് ഉണ്ടാക്കുക", createAccountBtn: "അക്കൗണ്ട് ഉണ്ടാക്കുക", creatingAccount: "അക്കൗണ്ട് ഉണ്ടാക്കുന്നു…", emailLabel: "ഇ-മെയിൽ", passwordLabel: "പാസ്‌വേഡ്", passwordHint: "കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ", fullNameLabel: "പൂർണ്ണ നാമം", newHere: "പുതിയതാണോ?", alreadyHaveAccount: "ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?"
};

// ─── PUNJABI ─────────────────────────────────────────────────────────────────
const pa: Translations = {
  appName: "ਨਿਆਂ-ਸਹਾਇਕ", tagline: "ਭਾਰਤ ਲਈ AI ਕਾਨੂੰਨੀ ਸਹਾਇਕ", legalAI: "ਕਾਨੂੰਨੀ AI",
  newConversation: "ਨਵੀਂ ਗੱਲਬਾਤ", tools: "ਸਾਧਨ", history: "ਇਤਿਹਾਸ", settings: "ਸੈਟਿੰਗਜ਼",
  emergency: "ਐਮਰਜੈਂਸੀ", logout: "ਲੌਗ ਆਊਟ", adminPanel: "ਐਡਮਿਨ ਪੈਨਲ",
  inputLanguage: "ਇਨਪੁੱਟ ਭਾਸ਼ਾ", outputLanguage: "ਆਊਟਪੁੱਟ ਭਾਸ਼ਾ", voiceOutput: "ਆਵਾਜ਼ ਆਊਟਪੁੱਟ",
  readRepliesAloud: "AI ਜਵਾਬ ਉੱਚੀ ਆਵਾਜ਼ ਵਿੱਚ ਪੜ੍ਹੋ", simpleLanguage: "ਸਰਲ ਭਾਸ਼ਾ",
  simpleLanguageDesc: "ਕਾਨੂੰਨੀ ਸ਼ਬਦਾਂ ਤੋਂ ਬਿਨਾਂ ਸਮਝਾਓ",
  findNearestHelp: "ਨੇੜੇ ਦੀ ਮਦਦ ਲੱਭੋ", analyzeDocument: "ਦਸਤਾਵੇਜ਼ ਵਿਸ਼ਲੇਸ਼ਣ",
  knowYourRights: "ਆਪਣੇ ਅਧਿਕਾਰ ਜਾਣੋ", rtiApplication: "RTI ਅਰਜ਼ੀ",
  scanDocument: "ਦਸਤਾਵੇਜ਼ ਸਕੈਨ", legalNews: "ਕਾਨੂੰਨੀ ਖ਼ਬਰਾਂ", guidedLegalHelp: "ਮਾਰਗਦਰਸ਼ਿਤ ਮਦਦ",
  findLawyer: "ਵਕੀਲ ਲੱਭੋ", legalTemplates: "ਕਾਨੂੰਨੀ ਟੈਮਪਲੇਟ",
  caseStatusTracker: "ਕੇਸ ਸਥਿਤੀ", fileFirDraft: "FIR ਡਰਾਫਟ",
  dashboard: "ਮੇਰਾ ਡੈਸ਼ਬੋਰਡ", legalSearch: "ਕਾਨੂੰਨੀ ਖੋਜ",
  typeYourMessage: "ਆਪਣਾ ਕਾਨੂੰਨੀ ਸਵਾਲ ਟਾਈਪ ਕਰੋ…", pressEnterToSend: "ਭੇਜਣ ਲਈ Enter ਦਬਾਓ",
  askAnything: "ਭਾਰਤੀ ਕਾਨੂੰਨ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ — ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ",
  tapMicToSpeak: "ਬੋਲਣ ਲਈ 🎤 ਦਬਾਓ", stopGenerating: "ਰੋਕੋ", shareWhatsApp: "WhatsApp 'ਤੇ ਸਾਂਝਾ ਕਰੋ",
  disclaimer: "ਸਿਰਫ਼ ਆਮ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ — ਖਾਸ ਸਲਾਹ ਲਈ ਵਕੀਲ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  familyLaw: "ਪਰਿਵਾਰਕ ਕਾਨੂੰਨ", consumerRights: "ਖਪਤਕਾਰ ਅਧਿਕਾਰ", propertyLaw: "ਜਾਇਦਾਦ ਕਾਨੂੰਨ", criminalLaw: "ਅਪਰਾਧਿਕ ਕਾਨੂੰਨ",
  continue: "ਜਾਰੀ ਰੱਖੋ", back: "ਪਿੱਛੇ", close: "ਬੰਦ ਕਰੋ", save: "ਸੇਵ ਕਰੋ", upload: "ਅਪਲੋਡ ਕਰੋ",
  delete: "ਮਿਟਾਓ", edit: "ਸੰਪਾਦਿਤ ਕਰੋ", cancel: "ਰੱਦ ਕਰੋ", confirm: "ਪੁਸ਼ਟੀ ਕਰੋ", generate: "ਬਣਾਓ",
  download: "ਡਾਊਨਲੋਡ", search: "ਖੋਜੋ",
  fullName: "ਪੂਰਾ ਨਾਮ", age: "ਉਮਰ", gender: "ਲਿੰਗ", contact: "ਸੰਪਰਕ", email: "ਈਮੇਲ",
  address: "ਪਤਾ", city: "ਸ਼ਹਿਰ", state: "ਸੂਬਾ", district: "ਜ਼ਿਲ੍ਹਾ", pincode: "ਪਿਨਕੋਡ",
  loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…", success: "ਸਫਲ", error: "ਗਲਤੀ", tryAgain: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ", noData: "ਕੋਈ ਡੇਟਾ ਨਹੀਂ",
  section: "ਧਾਰਾ", act: "ਕਾਨੂੰਨ", court: "ਅਦਾਲਤ", lawyer: "ਵਕੀਲ", case: "ਕੇਸ",
  petition: "ਪਟੀਸ਼ਨ", evidence: "ਸਬੂਤ", witness: "ਗਵਾਹ", complaint: "ਸ਼ਿਕਾਇਤ",
  firDraft: "FIR ਡਰਾਫਟ", officialFormat: "ਸਰਕਾਰੀ ਫਾਰਮੈਟ · ਫਾਰਮ 24.1", policeStation: "ਪੁਲਿਸ ਥਾਣਾ",
  yourDetails: "ਤੁਹਾਡੀਆਂ ਜਾਣਕਾਰੀਆਂ", incidentEvidence: "ਘਟਨਾ + ਸਬੂਤ",
  rtiTitle: "RTI ਅਰਜ਼ੀ", applicantDetails: "ਅਰਜ਼ੀਕਰਤਾ ਦੇ ਵੇਰਵੇ", informationSought: "ਮੰਗੀ ਗਈ ਜਾਣਕਾਰੀ",
  youAreOffline: "ਤੁਸੀਂ ਔਫਲਾਈਨ ਹੋ", backOnline: "ਦੁਬਾਰਾ ਔਨਲਾਈਨ", emergencyNumbers: "ਐਮਰਜੈਂਸੀ ਨੰਬਰ",
  offlineMessage: "ਚੈਟ ਉਪਲਬਧ ਨਹੀਂ। ਹੇਠਾਂ ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ ਦੇਖੋ।",
  chooseLanguage: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ", chooseLanguageDesc: "ਉਹ ਭਾਸ਼ਾ ਚੁਣੋ ਜਿਸ ਵਿੱਚ ਤੁਸੀਂ ਸਭ ਤੋਂ ਸਹਿਜ ਮਹਿਸੂਸ ਕਰਦੇ ਹੋ",
  continueIn: "ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ",
  freeLegalAid: "ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਉਪਲਬਧ", freeLegalAidDesc: "NALSA: 1800-110-370 · ਟੈਲੀ-ਲਾ: 1800-120-1075",
  signIn: "ਸਾਈਨ ਇਨ ਕਰੋ", signInSubtitle: "ਜਾਰੀ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ", signInBtn: "ਸਾਈਨ ਇਨ", signingIn: "ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ…", createAccount: "ਖਾਤਾ ਬਣਾਓ", createAccountSubtitle: "ਆਪਣਾ ਖਾਤਾ ਬਣਾਓ", createAccountBtn: "ਖਾਤਾ ਬਣਾਓ", creatingAccount: "ਖਾਤਾ ਬਣ ਰਿਹਾ ਹੈ…", emailLabel: "ਈਮੇਲ", passwordLabel: "ਪਾਸਵਰਡ", passwordHint: "ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰ", fullNameLabel: "ਪੂਰਾ ਨਾਮ", newHere: "ਨਵੇਂ ਹੋ?", alreadyHaveAccount: "ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?"
};

// ─── ODIA ─────────────────────────────────────────────────────────────────────
const or: Translations = {
  appName: "ନ୍ୟାୟ-ସହାୟକ", tagline: "ଭାରତ ପାଇଁ AI ଆଇନ ସହାୟକ", legalAI: "ଆଇନ AI",
  newConversation: "ନୂତନ କଥୋପକଥନ", tools: "ଉପକରଣ", history: "ଇତିହାସ", settings: "ସେଟିଂ",
  emergency: "ଜରୁରୀ ଅବସ୍ଥା", logout: "ଲଗ୍ ଆଉଟ", adminPanel: "ଆଡ୍ମିନ ପ୍ୟାନେଲ",
  inputLanguage: "ଇନ୍‌ପୁଟ ଭାଷା", outputLanguage: "ଆଉଟ୍‌ପୁଟ ଭାଷା", voiceOutput: "ଶବ୍ଦ ଆଉଟ୍‌ପୁଟ",
  readRepliesAloud: "AI ଉତ୍ତର ଜୋରରେ ପଢ଼ନ୍ତୁ", simpleLanguage: "ସରଳ ଭାଷା",
  simpleLanguageDesc: "ଆଇନ ଶବ୍ଦ ବିନା ବ୍ୟାଖ୍ୟା କରନ୍ତୁ",
  findNearestHelp: "ନିକଟ ସାହାଯ୍ୟ ଖୋଜନ୍ତୁ", analyzeDocument: "ଦଲିଲ ବିଶ୍ଳେଷଣ",
  knowYourRights: "ଆପଣଙ୍କ ଅଧିକାର ଜାଣନ୍ତୁ", rtiApplication: "RTI ଆବେଦନ",
  scanDocument: "ଦଲିଲ ସ୍କାନ", legalNews: "ଆଇନ ସମ୍ବାଦ", guidedLegalHelp: "ମାର୍ଗଦର୍ଶିତ ସାହାଯ୍ୟ",
  findLawyer: "ଓକିଲ ଖୋଜନ୍ତୁ", legalTemplates: "ଆଇନ ଟେମ୍ପ୍ଲେଟ",
  caseStatusTracker: "ମାମଲା ସ୍ଥିତି", fileFirDraft: "FIR ଡ୍ରାଫ୍ଟ",
  dashboard: "ମୋ ଡ୍ୟାସ୍‌ବୋର୍ଡ", legalSearch: "ଆଇନ ଖୋଜ",
  typeYourMessage: "ଆପଣଙ୍କ ଆଇନ ପ୍ରଶ୍ନ ଟାଇପ କରନ୍ତୁ…", pressEnterToSend: "ପଠାଇବାକୁ Enter ଦବାନ୍ତୁ",
  askAnything: "ଭାରତୀୟ ଆଇନ ବିଷୟରେ ଯାହା ଇଚ୍ଛା ପଚାରନ୍ତୁ — ଆପଣଙ୍କ ଭାଷାରେ",
  tapMicToSpeak: "କଥା ବଳିବାକୁ 🎤 ଦବାନ୍ତୁ", stopGenerating: "ବନ୍ଦ କରନ୍ତୁ", shareWhatsApp: "WhatsApp ରେ ଶେୟାର କରନ୍ତୁ",
  disclaimer: "କେବଳ ସାଧାରଣ ଆଇନ ସୂଚନା — ନିର୍ଦ୍ଦିଷ୍ଟ ପରାମର୍ଶ ପାଇଁ ଓକିଲଙ୍କ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ",
  familyLaw: "ପାରିବାରିକ ଆଇନ", consumerRights: "ଗ୍ରାହକ ଅଧିକାର", propertyLaw: "ସ୍ଥାବର ଆଇନ", criminalLaw: "ଦଣ୍ଡ ଆଇନ",
  continue: "ଜାରି ରଖନ୍ତୁ", back: "ପଛକୁ", close: "ବନ୍ଦ କରନ୍ତୁ", save: "ସେଭ କରନ୍ତୁ", upload: "ଅପଲୋଡ",
  delete: "ଡିଲିଟ", edit: "ସମ୍ପାଦନ", cancel: "ବାତିଲ", confirm: "ନିଶ୍ଚିତ କରନ୍ତୁ", generate: "ତିଆରି କରନ୍ତୁ",
  download: "ଡାଉନଲୋଡ", search: "ଖୋଜ",
  fullName: "ପୂର୍ଣ ନାମ", age: "ବୟସ", gender: "ଲିଙ୍ଗ", contact: "ଯୋଗାଯୋଗ", email: "ଇମେଲ",
  address: "ଠିକଣା", city: "ସହର", state: "ରାଜ୍ୟ", district: "ଜିଲ୍ଲା", pincode: "ପିନକୋଡ",
  loading: "ଲୋଡ ହଉଛି…", success: "ସଫଳ", error: "ତ୍ରୁଟି", tryAgain: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ", noData: "ଡାଟା ନାହିଁ",
  section: "ଧାରା", act: "ଆଇନ", court: "ନ୍ୟାୟାଳୟ", lawyer: "ଓକିଲ", case: "ମାମଲା",
  petition: "ଆବେଦନ", evidence: "ପ୍ରମାଣ", witness: "ସାକ୍ଷୀ", complaint: "ଅଭିଯୋଗ",
  firDraft: "FIR ଡ୍ରାଫ୍ଟ", officialFormat: "ସରକାରୀ ଫର୍ମାଟ · ଫର୍ମ 24.1", policeStation: "ପୋଲିସ ଷ୍ଟେସନ",
  yourDetails: "ଆପଣଙ୍କ ବିବରଣୀ", incidentEvidence: "ଘଟଣା + ପ୍ରମାଣ",
  rtiTitle: "RTI ଆବେଦନ", applicantDetails: "ଆବେଦନକାରୀ ବିବରଣୀ", informationSought: "ଚାଇଥିବା ସୂଚନା",
  youAreOffline: "ଆପଣ ଅଫଲାଇନ ଅଛନ୍ତି", backOnline: "ପୁଣି ଅନଲାଇନ", emergencyNumbers: "ଜରୁରୀ ନମ୍ବର",
  offlineMessage: "ଚାଟ ଉପଲବ୍ଧ ନୁହେଁ। ନିଚରେ ଜରୁରୀ ସମ୍ପର୍କ ଦେଖନ୍ତୁ।",
  chooseLanguage: "ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ", chooseLanguageDesc: "ଆପଣ ସବୁଠୁ ସହଜ ଅନୁଭବ କରୁଥିବା ଭାଷା ବାଛନ୍ତୁ",
  continueIn: "ରେ ଜାରି ରଖନ୍ତୁ",
  freeLegalAid: "ମାଗଣା ଆଇନ ସାହାଯ୍ୟ ଉପଲବ୍ଧ", freeLegalAidDesc: "NALSA: 1800-110-370 · ଟେଲି-ଲ: 1800-120-1075",
  signIn: "ସାଇନ ଇନ କରନ୍ତୁ", signInSubtitle: "ଜାରି ରଖିବାକୁ ସାଇନ ଇନ କରନ୍ତୁ", signInBtn: "ସାଇନ ଇନ", signingIn: "ସାଇନ ଇନ ହେଉଛି…", createAccount: "ଖାତା ତିଆରି କରନ୍ତୁ", createAccountSubtitle: "ଆପଣଙ୍କ ଖାତା ତିଆରି କରନ୍ତୁ", createAccountBtn: "ଖାତା ତିଆରି କରନ୍ତୁ", creatingAccount: "ଖାତା ତିଆରି ହେଉଛି…", emailLabel: "ଇମେଲ", passwordLabel: "ପାସୱର୍ଡ", passwordHint: "କମ୍ ପକ୍ଷେ ୬ ଅକ୍ଷର", fullNameLabel: "ସଂପୂର୍ଣ ନାମ", newHere: "ନୂଆ ଅଛନ୍ତି?", alreadyHaveAccount: "ଈତିମଧ୍ୟ ଖାତା ଅଛି?"
};

export const translations: Record<Language, Translations> = { en, hi, bn, te, ta, mr, gu, kn, ml, pa, or };

export function useTranslation(language: Language): Translations {
  return translations[language] ?? translations.en;
}

// Detect browser language and map to supported language
export function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || (navigator as any).userLanguage || "en";
  const code = lang.split("-")[0].toLowerCase();
  const map: Record<string, Language> = {
    en: "en", hi: "hi", bn: "bn", te: "te", ta: "ta",
    mr: "mr", gu: "gu", kn: "kn", ml: "ml", pa: "pa", or: "or",
  };
  return map[code] || "en";
}
