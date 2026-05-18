"use client";
// frontend/src/components/LegalTemplates.tsx
import { useState, useEffect } from "react";
import { Download, Loader2, ChevronLeft, Languages, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Template { id: string; icon: string; title: string; desc: string; }
interface Props { onClose: () => void; language?: string; }

type FieldType = {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  inputType?: "text" | "date" | "number" | "select" | "textarea";
  options?: string[];
  labels?: Record<string, string>;
};

// ── Language UI strings ───────────────────────────────────────────────────────
const LANG_NAMES: Record<string, string> = {
  English:"English", Hindi:"हिंदी", Bengali:"বাংলা", Telugu:"తెలుగు",
  Marathi:"मराठी", Tamil:"தமிழ்", Gujarati:"ગુજરાતી", Kannada:"ಕನ್ನಡ",
  Malayalam:"മലയാളം", Punjabi:"ਪੰਜਾਬੀ", Odia:"ଓଡ଼ିଆ",
};

const UI: Record<string, {select:string;fill:string;generating:string;download:string;attach:string;add:string;modeOn:string;}> = {
  English:  {select:"Select",fill:"Fill all required (*) fields to download",generating:"Generating PDF…",download:"Download",attach:"Attach Evidence / Proof Images (optional)",add:"Add photos / screenshots",modeOn:"Form is in your language"},
  Hindi:    {select:"चुनें",fill:"PDF डाउनलोड करने के लिए सभी (*) फ़ील्ड भरें",generating:"PDF बना रहे हैं…",download:"डाउनलोड करें",attach:"साक्ष्य फ़ोटो संलग्न करें (वैकल्पिक)",add:"फ़ोटो जोड़ें",modeOn:"फ़ॉर्म हिंदी में है"},
  Bengali:  {select:"বেছে নিন",fill:"সব (*) ক্ষেত্র পূরণ করুন",generating:"PDF তৈরি হচ্ছে…",download:"ডাউনলোড করুন",attach:"প্রমাণ ছবি যুক্ত করুন (ঐচ্ছিক)",add:"ছবি যোগ করুন",modeOn:"ফর্মটি বাংলায় আছে"},
  Telugu:   {select:"ఎంచుకోండి",fill:"అన్ని (*) ఫీల్డ్‌లు నింపండి",generating:"PDF తయారవుతోంది…",download:"డౌన్‌లోడ్",attach:"సాక్ష్యం జోడించండి (ఐచ్ఛికం)",add:"ఫోటోలు జోడించండి",modeOn:"ఫారం తెలుగులో ఉంది"},
  Marathi:  {select:"निवडा",fill:"सर्व (*) फील्ड भरा",generating:"PDF तयार होत आहे…",download:"डाउनलोड करा",attach:"पुरावा फोटो जोडा (पर्यायी)",add:"फोटो जोडा",modeOn:"फॉर्म मराठीत आहे"},
  Tamil:    {select:"தேர்வு",fill:"அனைத்து (*) புலங்கள் நிரப்பவும்",generating:"PDF உருவாகிறது…",download:"பதிவிறக்கவும்",attach:"சான்று படங்கள் இணைக்கவும் (விருப்பம்)",add:"படங்கள் சேர்க்கவும்",modeOn:"படிவம் தமிழில் உள்ளது"},
  Gujarati: {select:"પસંદ કરો",fill:"બધા (*) ક્ષેત્ર ભરો",generating:"PDF બની રહ્યું છે…",download:"ડાઉનલોડ",attach:"પુરાવો ફોટો જોડો (વૈકલ્પિક)",add:"ફોટો ઉમેરો",modeOn:"ફોર્મ ગુજરાતીમાં છે"},
  Kannada:  {select:"ಆಯ್ಕೆ ಮಾಡಿ",fill:"ಎಲ್ಲಾ (*) ಕ್ಷೇತ್ರ ತುಂಬಿಸಿ",generating:"PDF ರಚನೆಯಾಗುತ್ತಿದೆ…",download:"ಡೌನ್‌ಲೋಡ್",attach:"ಸಾಕ್ಷ್ಯ ಫೋಟೋ ಲಗತ್ತಿಸಿ (ಐಚ್ಛಿಕ)",add:"ಫೋಟೋ ಸೇರಿಸಿ",modeOn:"ಫಾರ್ಮ್ ಕನ್ನಡದಲ್ಲಿದೆ"},
  Malayalam:{select:"തിരഞ്ഞെടുക്കുക",fill:"എല്ലാ (*) ഫീൽഡ് പൂരിപ്പിക്കുക",generating:"PDF ഉണ്ടാക്കുന്നു…",download:"ഡൗൺലോഡ്",attach:"തെളിവ് ഫോട്ടോ ചേർക്കുക (ഐഛിക)",add:"ഫോട്ടോ ചേർക്കുക",modeOn:"ഫോം മലയാളത്തിലാണ്"},
  Punjabi:  {select:"ਚੁਣੋ",fill:"ਸਾਰੇ (*) ਖੇਤਰ ਭਰੋ",generating:"PDF ਬਣ ਰਿਹਾ ਹੈ…",download:"ਡਾਊਨਲੋਡ",attach:"ਸਬੂਤ ਫ਼ੋਟੋ ਜੋੜੋ (ਵਿਕਲਪਿਕ)",add:"ਫ਼ੋਟੋ ਸ਼ਾਮਲ ਕਰੋ",modeOn:"ਫਾਰਮ ਪੰਜਾਬੀ ਵਿੱਚ ਹੈ"},
  Odia:     {select:"ବାଛନ୍ତୁ",fill:"ସମସ୍ତ (*) ଫିଲ୍ଡ ପୂରଣ କରନ୍ତୁ",generating:"PDF ତିଆରି ହେଉଛି…",download:"ଡାଉନଲୋଡ",attach:"ପ୍ରମାଣ ଫୋଟୋ ସଂଲଗ୍ନ କରନ୍ତୁ (ଐଚ୍ଛିକ)",add:"ଫୋଟୋ ଯୋଗ କରନ୍ତୁ",modeOn:"ଫର୍ମ ଓଡ଼ିଆରେ ଅଛି"},
};

// ── Field definitions ─────────────────────────────────────────────────────────
const FIELDS: Record<string, FieldType[]> = {
  legal_notice: [
    { id:"sender_name",       label:"Your Name",           required:true,  placeholder:"Ramesh Kumar",              labels:{Hindi:"आपका नाम",Bengali:"আপনার নাম",Telugu:"మీ పేరు",Marathi:"तुमचे नाव",Tamil:"உங்கள் பெயர்",Gujarati:"તમારું નામ",Kannada:"ನಿಮ್ಮ ಹೆಸರು",Malayalam:"നിങ്ങളുടെ പേര്",Punjabi:"ਤੁਹਾਡਾ ਨਾਮ",Odia:"ଆପଣଙ୍କ ନାମ"} },
    { id:"sender_address",    label:"Your Address",         required:true,  placeholder:"123, MG Road, Delhi",       labels:{Hindi:"आपका पता",Bengali:"আপনার ঠিকানা",Telugu:"మీ చిరునామా",Marathi:"तुमचा पत्ता",Tamil:"உங்கள் முகவரி",Gujarati:"તમારું સરનામું",Kannada:"ನಿಮ್ಮ ವಿಳಾಸ",Malayalam:"നിങ്ങളുടെ മേൽവിലാസം",Punjabi:"ਤੁਹਾਡਾ ਪਤਾ",Odia:"ଆପଣଙ୍କ ଠିକଣା"} },
    { id:"recipient_name",    label:"Recipient Name",       required:true,  placeholder:"ABC Company / Mr. Sharma",  labels:{Hindi:"प्राप्तकर्ता का नाम",Bengali:"প্রাপকের নাম",Telugu:"గ్రహీత పేరు",Marathi:"प्राप्तकर्त्याचे नाव",Tamil:"பெறுனர் பெயர்",Gujarati:"પ્રાપ્તકર્તાનું નામ",Kannada:"ಸ್ವೀಕರಿಸುವವರ ಹೆಸರು",Malayalam:"സ്വീകർത്താവിന്റെ പേര്",Punjabi:"ਪ੍ਰਾਪਤਕਰਤਾ ਦਾ ਨਾਮ",Odia:"ପ୍ରାପ୍ତକର୍ତ୍ତାଙ୍କ ନାମ"} },
    { id:"recipient_address", label:"Recipient Address",    required:true,  placeholder:"456, Park Street, Mumbai",  labels:{Hindi:"प्राप्तकर्ता का पता",Bengali:"প্রাপকের ঠিকানা",Telugu:"గ్రహీత చిరునామా",Marathi:"प्राप्तकर्त्याचा पत्ता",Tamil:"பெறுனர் முகவரி",Gujarati:"પ્રાપ્તકર્તાનું સરనામું",Kannada:"ಸ್ವೀಕರಿಸುವವರ ವಿಳಾಸ",Malayalam:"സ്വീകർത്താവിന്റെ മേൽവിലാസം",Punjabi:"ਪ੍ਰਾਪਤਕਰਤਾ ਦਾ ਪਤਾ",Odia:"ପ୍ରାପ୍ତକର୍ତ୍ତାଙ୍କ ଠିକଣା"} },
    { id:"subject",           label:"Subject of Notice",    required:true,  placeholder:"Recovery of due amount",    labels:{Hindi:"नोटिस का विषय",Bengali:"নোটিশের বিষয়",Telugu:"నోటీసు విషయం",Marathi:"नोटिसाचा विषय",Tamil:"அறிவிப்பின் தலைப்பு",Gujarati:"નોટિસનો વિષય",Kannada:"ನೋಟೀಸಿನ ವಿಷಯ",Malayalam:"നോട്ടീസിന്റെ വിഷയം",Punjabi:"ਨੋਟਿਸ ਦਾ ਵਿਸ਼ਾ",Odia:"ନୋଟିସ ବିଷୟ"} },
    { id:"amount_claimed",    label:"Amount Claimed (₹)",   placeholder:"50000",  inputType:"number",               labels:{Hindi:"दावा राशि (₹)",Bengali:"দাবি পরিমাণ (₹)",Telugu:"క్లెయిమ్ మొత్తం (₹)",Marathi:"दावा रक्कम (₹)",Tamil:"கோரும் தொகை (₹)",Gujarati:"દાવો રકમ (₹)",Kannada:"ಕ್ಲೈಮ್ ಮೊತ್ತ (₹)",Malayalam:"ക്ലെയിം തുക (₹)",Punjabi:"ਦਾਅਵਾ ਰਕਮ (₹)",Odia:"ଦାବି ରାଶି (₹)"} },
    { id:"days_to_comply",    label:"Days to Comply",        placeholder:"15",     inputType:"number",               labels:{Hindi:"अनुपालन के लिए दिन",Bengali:"পালন করার দিন",Telugu:"పాటించడానికి రోజులు",Marathi:"पालन करण्याचे दिवस",Tamil:"இணங்க நாட்கள்",Gujarati:"પાલન કરવાના દિવસ",Kannada:"ಅನುಸರಿಸಲು ದಿನಗಳು",Malayalam:"പാലിക്കാൻ ദിവസങ്ങൾ",Punjabi:"ਪਾਲਣ ਕਰਨ ਦੇ ਦਿਨ",Odia:"ପାଳନ ଦିବସ"} },
    { id:"content",           label:"Details of Dispute",   required:true,  placeholder:"Describe the issue in detail…", inputType:"textarea", labels:{Hindi:"विवाद का विवरण",Bengali:"বিবাদের বিবরণ",Telugu:"వివాదం వివరాలు",Marathi:"वादाचे तपशील",Tamil:"தகராறின் விவரங்கள்",Gujarati:"વિવાદની વિગત",Kannada:"ವಿವಾದದ ವಿವರ",Malayalam:"തർക്കത്തിന്റെ വിശദാംശങ്ങൾ",Punjabi:"ਵਿਵਾਦ ਦੀ ਵੇਰਵਾ",Odia:"ବିବାଦ ବିବରଣ"} },
  ],
  court_petition: [
    { id:"petitioner_name",    label:"Petitioner Name",    required:true, placeholder:"Your full name",           labels:{Hindi:"याचिकाकर्ता का नाम",Bengali:"আবেদনকারীর নাম",Telugu:"పిటిషనర్ పేరు",Marathi:"याचिकाकर्त्याचे नाव",Tamil:"மனுதாரர் பெயர்",Gujarati:"અરજદારનું નામ",Kannada:"ಅರ್ಜಿದಾರರ ಹೆಸರು",Malayalam:"ഹർജിക്കാരന്റെ പേര്",Punjabi:"ਅਰਜ਼ੀਕਰਤਾ ਦਾ ਨਾਮ",Odia:"ଆବେଦନକାରୀ ନାମ"} },
    { id:"petitioner_address", label:"Petitioner Address", required:true, placeholder:"Your address",             labels:{Hindi:"याचिकाकर्ता का पता",Bengali:"আবেদনকারীর ঠিকানা",Telugu:"పిటిషనర్ చిరునామా",Marathi:"याचिकाकर्त्याचा पत्ता",Tamil:"மனுதாரர் முகவரி",Gujarati:"અરજદારનું સરનામું",Kannada:"ಅರ್ಜಿದಾರರ ವಿಳಾಸ",Malayalam:"ഹർജിക്കാരന്റെ മേൽവിലാസം",Punjabi:"ਅਰਜ਼ੀਕਰਤਾ ਦਾ ਪਤਾ",Odia:"ଆବେଦନକାରୀ ଠିକଣା"} },
    { id:"respondent_name",    label:"Respondent Name",    required:true, placeholder:"Opposite party name",      labels:{Hindi:"प्रतिवादी का नाम",Bengali:"প্রতিবাদীর নাম",Telugu:"ప్రతివాది పేరు",Marathi:"प्रतिवादीचे नाव",Tamil:"பதிலளிப்பவர் பெயர்",Gujarati:"પ્રતિવાદીનું નામ",Kannada:"ಪ್ರತಿವಾದಿ ಹೆಸರು",Malayalam:"പ്രതിവാദിയുടെ പേര്",Punjabi:"ਜਵਾਬਦੇਹ ਦਾ ਨਾਮ",Odia:"ପ୍ରତ୍ୟୁତ୍ତରଦାତା ନାମ"} },
    { id:"respondent_address", label:"Respondent Address", required:true, placeholder:"Their address",            labels:{Hindi:"प्रतिवादी का पता",Bengali:"প্রতিবাদীর ঠিকানা",Telugu:"ప్రతివాది చిరునామా",Marathi:"प्रतिवादीचा पत्ता",Tamil:"பதிலளிப்பவர் முகவரி",Gujarati:"પ્રતિવાદીનું સરનામું",Kannada:"ಪ್ರತಿವಾದಿ ವಿಳಾಸ",Malayalam:"പ്രതിവാദിയുടെ മേൽവിലാസം",Punjabi:"ਜਵਾਬਦੇਹ ਦਾ ਪਤਾ",Odia:"ପ୍ରତ୍ୟୁତ୍ତରଦାତା ଠିକଣା"} },
    { id:"court_name",         label:"Court Name",         required:true, placeholder:"District Court, Delhi",    labels:{Hindi:"न्यायालय का नाम",Bengali:"আদালতের নাম",Telugu:"కోర్టు పేరు",Marathi:"न्यायालयाचे नाव",Tamil:"நீதிமன்றம் பெயர்",Gujarati:"કોર્ટનું નામ",Kannada:"ನ್ಯಾಯಾಲಯದ ಹೆಸರು",Malayalam:"കോടതിയുടെ പേര്",Punjabi:"ਅਦਾਲਤ ਦਾ ਨਾਮ",Odia:"ଅଦାଲତ ନାମ"} },
    { id:"case_type",          label:"Case Type",          required:true, placeholder:"", inputType:"select",
      options:["Civil","Criminal","Family","Consumer","Labour","Other"],
      labels:{Hindi:"मामले का प्रकार",Bengali:"মামলার ধরন",Telugu:"కేసు రకం",Marathi:"प्रकरणाचा प्रकार",Tamil:"வழக்கு வகை",Gujarati:"કેસ પ્રકાર",Kannada:"ಪ್ರಕರಣ ವಿಧ",Malayalam:"കേസ് തരം",Punjabi:"ਕੇਸ ਦੀ ਕਿਸਮ",Odia:"ମାମଲା ପ୍ରକାର"} },
    { id:"facts_of_case",      label:"Facts of the Case",  required:true, placeholder:"Explain what happened…", inputType:"textarea", labels:{Hindi:"मामले के तथ्य",Bengali:"মামলার তথ্য",Telugu:"కేసు వాస్తవాలు",Marathi:"प्रकरणाचे तथ्य",Tamil:"வழக்கின் உண்மைகள்",Gujarati:"કેસની હકીકત",Kannada:"ಪ್ರಕರಣದ ಸಂಗತಿಗಳು",Malayalam:"കേസിന്റെ വസ്തുതകൾ",Punjabi:"ਕੇਸ ਦੇ ਤੱਥ",Odia:"ମାମଲା ତଥ୍ୟ"} },
    { id:"relief_sought",      label:"Relief Sought",       required:true, placeholder:"What you want the court to order…", inputType:"textarea", labels:{Hindi:"मांगी गई राहत",Bengali:"প্রার্থিত ত্রাণ",Telugu:"కోరిన ఉపశమనం",Marathi:"मागितलेला दिलासा",Tamil:"நிவாரணம் கோரப்படுகிறது",Gujarati:"માગવામાં આવેલ રાહત",Kannada:"ಕೋರಿದ ಪರಿಹಾರ",Malayalam:"ആശ്വാസം ആവശ്യപ്പെടുന്നു",Punjabi:"ਮੰਗਿਆ ਰਾਹਤ",Odia:"ଉପଶମ ଚାହୁଁଛି"} },
    { id:"prayer",             label:"Prayer / Final Request", required:true, placeholder:"Your specific request to the court…", inputType:"textarea", labels:{Hindi:"प्रार्थना",Bengali:"প্রার্থনা",Telugu:"ప్రార్థన",Marathi:"प्रार्थना",Tamil:"வேண்டுகோள்",Gujarati:"પ્રાર્થના",Kannada:"ಪ್ರಾರ್ಥನೆ",Malayalam:"പ്രാർത്ഥന",Punjabi:"ਪ੍ਰਾਰਥਨਾ",Odia:"ପ୍ରାର୍ଥନା"} },
  ],
  affidavit: [
    { id:"deponent_name", label:"Your Full Name",                  required:true, placeholder:"As it appears in official documents", labels:{Hindi:"आपका पूरा नाम (शपथकर्ता)",Bengali:"শপথকারীর পূর্ণ নাম",Telugu:"ప్రమాణికుని పూర్తి పేరు",Marathi:"तुमचे पूर्ण नाव",Tamil:"உங்கள் முழு பெயர்",Gujarati:"તમારું પૂરું નામ",Kannada:"ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",Malayalam:"നിങ്ങളുടെ പൂർണ്ണ പേര്",Punjabi:"ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ",Odia:"ଆପଣଙ୍କ ସଂପୂର୍ଣ ନାମ"} },
    { id:"father_name",   label:"Father's / Husband's Name",       required:true, placeholder:"Father's or husband's full name",      labels:{Hindi:"पिता / पति का नाम",Bengali:"পিতা / স্বামীর নাম",Telugu:"తండ్రి / భర్త పేరు",Marathi:"वडिलांचे / पतीचे नाव",Tamil:"தந்தை / கணவர் பெயர்",Gujarati:"પિતા / પતિનું નામ",Kannada:"ತಂದೆ / ಪತಿ ಹೆಸರು",Malayalam:"അച്ഛൻ / ഭർത്താവ് പേര്",Punjabi:"ਪਿਤਾ / ਪਤੀ ਦਾ ਨਾਮ",Odia:"ପିତା / ସ୍ୱାମୀ ନାମ"} },
    { id:"age",           label:"Age (years)",                      required:true, placeholder:"35", inputType:"number",               labels:{Hindi:"आयु (वर्ष)",Bengali:"বয়স",Telugu:"వయసు",Marathi:"वय",Tamil:"வயது",Gujarati:"ઉંમર",Kannada:"ವಯಸ್ಸು",Malayalam:"പ്രായം",Punjabi:"ਉਮਰ",Odia:"ବୟସ"} },
    { id:"gender",        label:"Gender",                           required:true, placeholder:"", inputType:"select",
      options:["Male","Female","Other"],
      labels:{Hindi:"लिंग",Bengali:"লিঙ্গ",Telugu:"లింగం",Marathi:"लिंग",Tamil:"பாலினம்",Gujarati:"જાતિ",Kannada:"ಲಿಂಗ",Malayalam:"ലിംഗം",Punjabi:"ਲਿੰਗ",Odia:"ଲିଙ୍ଗ"} },
    { id:"address",       label:"Full Residential Address",         required:true, placeholder:"House No., Street, City, PIN code",   labels:{Hindi:"पूरा आवासीय पता",Bengali:"সম্পূর্ণ ঠিকানা",Telugu:"పూర్తి నివాస చిరునామా",Marathi:"पूर्ण निवासी पत्ता",Tamil:"முழு வீட்டு முகவரி",Gujarati:"સંપૂર્ણ રહેઠાણ સરનામું",Kannada:"ಸಂಪೂರ್ಣ ವಾಸದ ವಿಳಾಸ",Malayalam:"പൂർണ്ണ വാസ മേൽവിലാസം",Punjabi:"ਪੂਰਾ ਰਿਹਾਇਸ਼ੀ ਪਤਾ",Odia:"ସଂପୂର୍ଣ ଆବାସ ଠିକଣା"} },
    { id:"purpose",       label:"Purpose of Affidavit",             required:true, placeholder:"e.g. Name correction / Address proof / Date of birth proof", labels:{Hindi:"शपथपत्र का उद्देश्य",Bengali:"হলফনামার উদ্দেশ্য",Telugu:"అఫిడవిట్ ఉద్దేశ్యం",Marathi:"प्रतिज्ञापत्राचा उद्देश",Tamil:"உறுதிமொழியின் நோக்கம்",Gujarati:"સોગંધનામાનો હેતુ",Kannada:"ಅಫಿಡವಿಟ್‌ನ ಉದ್ದೇಶ",Malayalam:"സത്യവാചകത്തിന്റെ ഉദ്ദേശ്യം",Punjabi:"ਹਲਫਨਾਮੇ ਦਾ ਮਕਸਦ",Odia:"ଶପଥପତ୍ରର ଉଦ୍ଦେଶ୍ୟ"} },
    { id:"statements",    label:"Facts / Statements (what you declare is true)", required:true,
      placeholder:"Write each fact on a new line:\n1. My name was wrongly recorded as Suresh in school records.\n2. My correct name is Ramesh Kumar as per Aadhaar.\n3. Both names refer to the same person, i.e., me.",
      inputType:"textarea",
      labels:{Hindi:"तथ्य / कथन — जो आप सत्य घोषित कर रहे हैं\n(हर तथ्य नई पंक्ति में लिखें)",Bengali:"বিবৃতি / তথ্য",Telugu:"నిజమని ప్రమాణం చేస్తున్న విషయాలు",Marathi:"विधाने / तथ्ये",Tamil:"உண்மை என சத்தியம் செய்யும் விஷயங்கள்",Gujarati:"નિવેદનો / હકીકતો",Kannada:"ಹೇಳಿಕೆಗಳು / ಸಂಗತಿಗಳು",Malayalam:"പ്രസ്താവനകൾ / വസ്തുതകൾ",Punjabi:"ਬਿਆਨ / ਤੱਥ",Odia:"ବିବୃତ୍ତି / ତଥ୍ୟ"} },
    { id:"city",          label:"City / Place of Swearing",         required:true, placeholder:"New Delhi",                            labels:{Hindi:"शहर / शपथ का स्थान",Bengali:"শহর",Telugu:"నగరం",Marathi:"शहर",Tamil:"நகரம்",Gujarati:"શહેર",Kannada:"ನಗರ",Malayalam:"നഗരം",Punjabi:"ਸ਼ਹਿਰ",Odia:"ସହର"} },
    { id:"date",          label:"Date",                             required:true, placeholder:"", inputType:"date",                   labels:{Hindi:"तारीख",Bengali:"তারিখ",Telugu:"తేదీ",Marathi:"तारीख",Tamil:"தேதி",Gujarati:"તારીખ",Kannada:"ದಿನಾಂಕ",Malayalam:"തീയതി",Punjabi:"ਮਿਤੀ",Odia:"ତାରିଖ"} },
  ],
  rental_agreement: [
    { id:"landlord_name",    label:"Landlord Name",        required:true, placeholder:"Owner's full name",          labels:{Hindi:"मकान मालिक का नाम",Bengali:"বাড়ির মালিকের নাম",Telugu:"ఇంటి యజమాని పేరు",Marathi:"मकान मालकाचे नाव",Tamil:"வீட்டு உரிமையாளர் பெயர்",Gujarati:"મકાનમાલિકનું નામ",Kannada:"ಮನೆ ಮಾಲೀಕರ ಹೆಸರು",Malayalam:"വീട്ടുടമയുടെ പേര്",Punjabi:"ਮਕਾਨ ਮਾਲਕ ਦਾ ਨਾਮ",Odia:"ଘର ମାଲିକ ନାମ"} },
    { id:"tenant_name",      label:"Tenant Name",          required:true, placeholder:"Tenant's full name",         labels:{Hindi:"किरायेदार का नाम",Bengali:"ভাড়াটেদের নাম",Telugu:"అద్దెదారు పేరు",Marathi:"भाडेकरूचे नाव",Tamil:"குத்தகைதாரர் பெயர்",Gujarati:"ભાડૂઆતનું નામ",Kannada:"ಬಾಡಿಗೆದಾರರ ಹೆಸರು",Malayalam:"വാടകക்கারന്റെ পের্",Punjabi:"ਕਿਰਾਏਦਾਰ ਦਾ ਨਾਮ",Odia:"ଭଡ଼ାଟିଆ ନାମ"} },
    { id:"property_address", label:"Property Address",     required:true, placeholder:"Full address of the property", labels:{Hindi:"संपत्ति का पता",Bengali:"সম্পত্তির ঠিকানা",Telugu:"ఆస్తి చిరునామా",Marathi:"मालमत्तेचा पत्ता",Tamil:"சொத்து முகவரி",Gujarati:"મિલ્કતનું સરનામું",Kannada:"ಆಸ್ತಿಯ ವಿಳಾಸ",Malayalam:"സ്വത്തിന്റെ മേൽവിലാസം",Punjabi:"ਜਾਇਦਾਦ ਦਾ ਪਤਾ",Odia:"ସଂପତ୍ତି ଠିକଣା"} },
    { id:"monthly_rent",     label:"Monthly Rent (₹)",     required:true, placeholder:"15000", inputType:"number",   labels:{Hindi:"मासिक किराया (₹)",Bengali:"মাসিক ভাড়া (₹)",Telugu:"నెలవారీ అద్దె (₹)",Marathi:"मासिक भाडे (₹)",Tamil:"மாதாந்திர வாடகை (₹)",Gujarati:"માસિક ભાડું (₹)",Kannada:"ಮಾಸಿಕ ಬಾಡಿಗೆ (₹)",Malayalam:"മാസ വാടക (₹)",Punjabi:"ਮਾਸਿਕ ਕਿਰਾਇਆ (₹)",Odia:"ମାସିକ ଭଡ଼ା (₹)"} },
    { id:"security_deposit", label:"Security Deposit (₹)", required:true, placeholder:"30000", inputType:"number",   labels:{Hindi:"सुरक्षा जमा (₹)",Bengali:"নিরাপত্তা জমা (₹)",Telugu:"భద్రతా డిపాజిట్ (₹)",Marathi:"सुरक्षा ठेव (₹)",Tamil:"பாதுகாப்பு வைப்பு (₹)",Gujarati:"સિક્યુરિટી ડિપોઝિટ (₹)",Kannada:"ಭದ್ರತಾ ಠೇವಣಿ (₹)",Malayalam:"സെക്യൂരിറ്റി ഡിപ്പോസിറ്റ് (₹)",Punjabi:"ਸੁਰੱਖਿਆ ਜਮ੍ਹਾਂ (₹)",Odia:"ସୁରକ୍ଷା ଜମା (₹)"} },
    { id:"duration_months",  label:"Duration (months)",    required:true, placeholder:"11",    inputType:"number",   labels:{Hindi:"अवधि (महीने)",Bengali:"মেয়াদ (মাস)",Telugu:"వ్యవధి (నెలలు)",Marathi:"कालावधी (महिने)",Tamil:"காலம் (மாதங்கள்)",Gujarati:"અવધિ (મહિના)",Kannada:"ಅವಧಿ (ತಿಂಗಳು)",Malayalam:"കാലാവധി (മാസം)",Punjabi:"ਮਿਆਦ (ਮਹੀਨੇ)",Odia:"ଅବଧି (ମାସ)"} },
    { id:"start_date",       label:"Start Date",           required:true, placeholder:"", inputType:"date",         labels:{Hindi:"प्रारंभ तिथि",Bengali:"শুরুর তারিখ",Telugu:"ప్రారంభ తేదీ",Marathi:"प्रारंभ तारीख",Tamil:"தொடக்க தேதி",Gujarati:"શરૂ થવાની તારીખ",Kannada:"ಪ್ರಾರಂಭ ದಿನಾಂಕ",Malayalam:"ആരംഭ തീയതി",Punjabi:"ਸ਼ੁਰੂਆਤੀ ਮਿਤੀ",Odia:"ଆରମ୍ଭ ତାରିଖ"} },
    { id:"city",             label:"City",                 required:true, placeholder:"Mumbai",                     labels:{Hindi:"शहर",Bengali:"শহর",Telugu:"నగరం",Marathi:"शहर",Tamil:"நகரம்",Gujarati:"શહેર",Kannada:"ನಗರ",Malayalam:"നഗരം",Punjabi:"ਸ਼ਹਿਰ",Odia:"ସହର"} },
  ],
  sale_agreement: [
    { id:"seller_name",          label:"Seller Name",          required:true, placeholder:"Full name of seller",    labels:{Hindi:"विक्रेता का नाम",Bengali:"বিক্রেতার নাম",Telugu:"విక్రేత పేరు",Marathi:"विक्रेत्याचे नाव",Tamil:"விற்பனையாளர் பெயர்",Gujarati:"વેચાણ કર્તાનું નામ",Kannada:"ಮಾರಾಟಗಾರ ಹೆಸರು",Malayalam:"വിൽക്കുന്നവന്റെ പേര്",Punjabi:"ਵੇਚਣ ਵਾਲੇ ਦਾ ਨਾਮ",Odia:"ବିକ୍ରେତା ନାମ"} },
    { id:"buyer_name",           label:"Buyer Name",           required:true, placeholder:"Full name of buyer",     labels:{Hindi:"क्रेता का नाम",Bengali:"ক্রেতার নাম",Telugu:"కొనుగోలుదారు పేరు",Marathi:"खरेदीदाराचे नाव",Tamil:"வாங்குபவர் பெயர்",Gujarati:"ખરીદનારનું નામ",Kannada:"ಖರೀದಿದಾರ ಹೆಸರು",Malayalam:"വാങ്ങുന്നവന്റെ പേര്",Punjabi:"ਖਰੀਦਦਾਰ ਦਾ ਨਾਮ",Odia:"କ୍ରେତା ନାମ"} },
    { id:"property_description", label:"Property Description", required:true, placeholder:"Plot No., Sector, City — with survey number and area in sq ft", inputType:"textarea", labels:{Hindi:"संपत्ति का विवरण",Bengali:"সম্পত্তির বিবরণ",Telugu:"ఆస్తి వివరణ",Marathi:"मालमत्तेचे वर्णन",Tamil:"சொத்து விவரம்",Gujarati:"મિલ્કતનું વર્ણન",Kannada:"ಆಸ್ತಿ ವಿವರಣೆ",Malayalam:"സ്വത്തിന്റെ വിവരണം",Punjabi:"ਜਾਇਦਾਦ ਦਾ ਵੇਰਵਾ",Odia:"ସଂପତ୍ତି ବିବରଣ"} },
    { id:"sale_price",           label:"Sale Price (₹)",       required:true, placeholder:"5000000", inputType:"number", labels:{Hindi:"बिक्री मूल्य (₹)",Bengali:"বিক্রয় মূল্য (₹)",Telugu:"విక్రయ ధర (₹)",Marathi:"विक्री किंमत (₹)",Tamil:"விற்பனை விலை (₹)",Gujarati:"વેચાણ કિંમત (₹)",Kannada:"ಮಾರಾಟ ಬೆಲೆ (₹)",Malayalam:"വിൽപ്പന വില (₹)",Punjabi:"ਵਿਕਰੀ ਕੀਮਤ (₹)",Odia:"ବିକ୍ରୟ ମୂଲ୍ୟ (₹)"} },
    { id:"advance_paid",         label:"Advance Paid (₹)",     required:true, placeholder:"500000",  inputType:"number", labels:{Hindi:"अग्रिम राशि (₹)",Bengali:"অগ্রিম প্রদত্ত (₹)",Telugu:"అడ్వాన్స్ (₹)",Marathi:"आगाऊ रक्कम (₹)",Tamil:"முன்பணம் (₹)",Gujarati:"એડવાન્સ (₹)",Kannada:"ಮುಂಗಡ (₹)",Malayalam:"അഡ്വാൻസ് (₹)",Punjabi:"ਪੇਸ਼ਗੀ (₹)",Odia:"ଅଗ୍ରୀମ (₹)"} },
    { id:"balance_amount",       label:"Balance Amount (₹)",   required:true, placeholder:"4500000", inputType:"number", labels:{Hindi:"शेष राशि (₹)",Bengali:"অবশিষ্ট পরিমাণ (₹)",Telugu:"మిగిలిన మొత్తం (₹)",Marathi:"शिल्लक रक्कम (₹)",Tamil:"மீதமுள்ள தொகை (₹)",Gujarati:"બાકી રકમ (₹)",Kannada:"ಉಳಿದ ಮೊತ್ತ (₹)",Malayalam:"ബാക്കി തുക (₹)",Punjabi:"ਬਾਕੀ ਰਕਮ (₹)",Odia:"ଅବଶିଷ୍ଟ ରାଶି (₹)"} },
    { id:"registration_date",    label:"Registration By Date", required:true, placeholder:"", inputType:"date",           labels:{Hindi:"पंजीकरण की अंतिम तिथि",Bengali:"নিবন্ধন তারিখ",Telugu:"నమోదు తేదీ",Marathi:"नोंदणी तारीख",Tamil:"பதிவு தேதி",Gujarati:"નોંધણી તારીખ",Kannada:"ನೋಂದಣಿ ದಿನಾಂಕ",Malayalam:"രജിസ്ട്രേഷൻ തീയതി",Punjabi:"ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਮਿਤੀ",Odia:"ପଞ୍ଜୀକରଣ ତାରିଖ"} },
    { id:"city",                 label:"City",                 required:true, placeholder:"Noida",                        labels:{Hindi:"शहर",Bengali:"শহর",Telugu:"నగరం",Marathi:"शहर",Tamil:"நகரம்",Gujarati:"શહેર",Kannada:"ನಗರ",Malayalam:"നഗരം",Punjabi:"ਸ਼ਹਿਰ",Odia:"ସହର"} },
  ],
  fir_draft: [
    { id:"full_name",            label:"Complainant Full Name",         required:true, placeholder:"Ramesh Kumar",             labels:{Hindi:"शिकायतकर्ता का पूरा नाम",Bengali:"অভিযোগকারীর পূর্ণ নাম",Telugu:"ఫిర్యాదుదారు పూర్తి పేరు",Marathi:"तक्रारदाराचे पूर्ण नाव",Tamil:"புகார்தாரர் முழு பெயர்",Gujarati:"ફરિયાદીનું પૂરું નામ",Kannada:"ದೂರುದಾರರ ಹೆಸರು",Malayalam:"പരാതിക്കാരന്റെ പൂർണ്ണ പേര്",Punjabi:"ਸ਼ਿਕਾਇਤਕਰਤਾ ਦਾ ਪੂਰਾ ਨਾਮ",Odia:"ଅଭିଯୋଗକାରୀ ସଂପୂର୍ଣ ନାମ"} },
    { id:"father_name",          label:"Father's / Husband's Name",    required:true, placeholder:"Suresh Kumar",             labels:{Hindi:"पिता/पति का नाम",Bengali:"পিতা/স্বামীর নাম",Telugu:"తండ్రి/భర్త పేరు",Marathi:"वडिलांचे/पतीचे नाव",Tamil:"தந்தை/கணவர் பெயர்",Gujarati:"પિતા/પતિ નામ",Kannada:"ತಂದೆ/ಪತಿ ಹೆಸರು",Malayalam:"അച്ഛൻ/ഭർത്താവ്",Punjabi:"ਪਿਤਾ/ਪਤੀ ਦਾ ਨਾਮ",Odia:"ପିତା/ସ୍ୱାମୀ ନାମ"} },
    { id:"age",                  label:"Age",                           required:true, placeholder:"35", inputType:"number",    labels:{Hindi:"आयु",Bengali:"বয়স",Telugu:"వయసు",Marathi:"वय",Tamil:"வயது",Gujarati:"ઉંમર",Kannada:"ವಯಸ್ಸು",Malayalam:"പ്രായം",Punjabi:"ਉਮਰ",Odia:"ବୟସ"} },
    { id:"gender",               label:"Gender",                        required:true, placeholder:"", inputType:"select",
      options:["Female","Male","Other"],
      labels:{Hindi:"लिंग",Bengali:"লিঙ্গ",Telugu:"లింగం",Marathi:"लिंग",Tamil:"பாலினம்",Gujarati:"જાતિ",Kannada:"ಲಿಂಗ",Malayalam:"ലിംഗം",Punjabi:"ਲਿੰਗ",Odia:"ଲିଙ୍ଗ"} },
    { id:"contact",              label:"Mobile Number",                 required:true, placeholder:"9876543210",               labels:{Hindi:"मोबाइल नंबर",Bengali:"মোবাইল নম্বর",Telugu:"మొబైల్ నంబర్",Marathi:"मोबाइल नंबर",Tamil:"கைபேசி எண்",Gujarati:"મોબાઈલ",Kannada:"ಮೊಬೈಲ್",Malayalam:"മൊബൈൽ",Punjabi:"ਮੋਬਾਈਲ",Odia:"ମୋବାଇଲ"} },
    { id:"address_line1",        label:"Address",                       required:true, placeholder:"House No., Street, Area",   labels:{Hindi:"पता",Bengali:"ঠিকানা",Telugu:"చిరునామా",Marathi:"पत्ता",Tamil:"முகவரி",Gujarati:"સરનામું",Kannada:"ವಿಳಾಸ",Malayalam:"മേൽവിലാസം",Punjabi:"ਪਤਾ",Odia:"ଠିକଣା"} },
    { id:"city",                 label:"City",                          required:true, placeholder:"New Delhi",                 labels:{Hindi:"शहर",Bengali:"শহর",Telugu:"నగరం",Marathi:"शहर",Tamil:"நகரம்",Gujarati:"શહેર",Kannada:"ನಗರ",Malayalam:"നഗരം",Punjabi:"ਸ਼ਹਿਰ",Odia:"ସହର"} },
    { id:"district",             label:"District",                      required:true, placeholder:"South Delhi",               labels:{Hindi:"जिला",Bengali:"জেলা",Telugu:"జిల్లా",Marathi:"जिल्हा",Tamil:"மாவட்டம்",Gujarati:"જિલ્લો",Kannada:"ಜಿಲ್ಲೆ",Malayalam:"ജില്ല",Punjabi:"ਜ਼ਿਲ੍ਹਾ",Odia:"ଜିଲ୍ଲା"} },
    { id:"state",                label:"State",                         required:true, placeholder:"Delhi",                     labels:{Hindi:"राज्य",Bengali:"রাজ্য",Telugu:"రాష్ట్రం",Marathi:"राज्य",Tamil:"மாநிலம்",Gujarati:"રાજ્ય",Kannada:"ರಾಜ್ಯ",Malayalam:"സംസ്ഥാനം",Punjabi:"ਸੂਬਾ",Odia:"ରାଜ୍ୟ"} },
    { id:"police_station",       label:"Police Station",                required:true, placeholder:"Lajpat Nagar PS",          labels:{Hindi:"पुलिस थाना",Bengali:"পুলিশ স্টেশন",Telugu:"పోలీస్ స్టేషన్",Marathi:"पोलीस ठाणे",Tamil:"காவல் நிலையம்",Gujarati:"પોલીસ સ્ટેશન",Kannada:"ಪೊಲೀಸ್ ಠಾಣೆ",Malayalam:"പോലീസ് സ്റ്റേഷൻ",Punjabi:"ਪੁਲਿਸ ਸਟੇਸ਼ਨ",Odia:"ପୋଲିସ ଷ୍ଟେସନ"} },
    { id:"incident_date",        label:"Date of Incident",              required:true, placeholder:"", inputType:"date",         labels:{Hindi:"घटना की तारीख",Bengali:"ঘটনার তারিখ",Telugu:"సంఘటన తేదీ",Marathi:"घटनेची तारीख",Tamil:"சம்பவம் தேதி",Gujarati:"ઘટનાની તારીખ",Kannada:"ಘಟನೆ ದಿನಾಂಕ",Malayalam:"സംഭവ തീയതി",Punjabi:"ਘਟਨਾ ਦੀ ਮਿਤੀ",Odia:"ଘଟଣା ତାରିଖ"} },
    { id:"incident_location",    label:"Place of Incident",             required:true, placeholder:"Full address where it happened", labels:{Hindi:"घटना का स्थान",Bengali:"ঘটনার স্থান",Telugu:"సంఘటన స్థలం",Marathi:"घटनेचे ठिकाण",Tamil:"சம்பவ இடம்",Gujarati:"ઘટનાની જગ્યા",Kannada:"ಘಟನೆ ಸ್ಥಳ",Malayalam:"സംഭവ സ്ഥലം",Punjabi:"ਘਟਨਾ ਦੀ ਜਗ੍ਹਾ",Odia:"ଘଟଣା ସ୍ଥାନ"} },
    { id:"incident_description", label:"Full Description of Incident",  required:true, placeholder:"Describe exactly what happened, step by step…", inputType:"textarea", labels:{Hindi:"घटना का पूरा विवरण",Bengali:"ঘটনার সম্পূর্ণ বিবরণ",Telugu:"సంఘటన పూర్తి వివరణ",Marathi:"घटनेचे संपूर्ण वर्णन",Tamil:"சம்பவத்தின் முழு விவரம்",Gujarati:"ઘટનાનો સંપૂર્ણ વિગત",Kannada:"ಘಟನೆಯ ವಿವರ",Malayalam:"സംഭവത്തിന്റെ വിശദ വിവരണം",Punjabi:"ਘਟਨਾ ਦਾ ਪੂਰਾ ਵੇਰਵਾ",Odia:"ଘଟଣା ସଂପୂର୍ଣ ବିବରଣ"} },
    { id:"accused_details",      label:"Accused Details (if known)",    placeholder:"Name, address, relation (if known)", inputType:"textarea", labels:{Hindi:"आरोपी का विवरण",Bengali:"অভিযুক্তের বিবরণ",Telugu:"నిందితుని వివరాలు",Marathi:"आरोपीचे तपशील",Tamil:"குற்றவாளி விவரங்கள்",Gujarati:"આરોपीની વિগત",Kannada:"ಆರೋಪಿ ವಿವರ",Malayalam:"പ്രതിയുടെ വിവരം",Punjabi:"ਦੋਸ਼ੀ ਦਾ ਵੇਰਵਾ",Odia:"ଅଭିଯୁକ୍ତ ବିବରଣ"} },
    { id:"witnesses",            label:"Witnesses (if any)",             placeholder:"Name and contact of witnesses",      labels:{Hindi:"गवाह (यदि कोई हो)",Bengali:"সাক্ষী",Telugu:"సాక్షులు",Marathi:"साक्षीदार",Tamil:"சாட்சிகள்",Gujarati:"સાક્ષીઓ",Kannada:"ಸಾಕ್ಷಿಗಳು",Malayalam:"സാക്ഷികൾ",Punjabi:"ਗਵਾਹ",Odia:"ସାକ୍ଷୀ"} },
    { id:"property_involved",    label:"Property Stolen / Damaged",      placeholder:"Description and approximate value",  labels:{Hindi:"चोरी/क्षतिग्रस्त संपत्ति",Bengali:"চুরি/ক্ষতিগ্রস্ত সম্পত্তি",Telugu:"దొంగిలించిన/దెబ్బతిన్న సొత్తు",Marathi:"चोरलेली/नुकसानग्रस्त मालमत्ता",Tamil:"திருட்டு/சேதமடைந்த சொத்து",Gujarati:"ચોરી/નુકsane મિลkata",Kannada:"ಕದ್ದ/ಹಾನಿ ಆಸ್ತಿ",Malayalam:"മോഷ്ടിക്കപ്പെട്ട/കേടായ സ്വത്ത്",Punjabi:"ਚੋਰੀ/ਨੁਕਸਾਨ ਜਾਇਦਾਦ",Odia:"ଚୋରି/କ୍ଷତି ସଂପତ୍ତି"} },
  ],
  employment_offer: [
    { id:"company_name",     label:"Company Name",              required:true, placeholder:"ABC Technologies Pvt Ltd", labels:{Hindi:"कंपनी का नाम",Bengali:"কোম্পানির নাম",Telugu:"కంపెనీ పేరు",Marathi:"कंपनीचे नाव",Tamil:"நிறுவன பெயர்",Gujarati:"કંపनीну નામ",Kannada:"ಕಂಪನಿ ಹೆಸರು",Malayalam:"കമ്പനിയുടെ പേര്",Punjabi:"ਕੰਪਨੀ ਦਾ ਨਾਮ",Odia:"କମ୍ପାନି ନାମ"} },
    { id:"company_address",  label:"Company Address",           required:true, placeholder:"Full registered address",  labels:{Hindi:"कंपनी का पता",Bengali:"কোম্পানির ঠিকানা",Telugu:"కంపెనీ చిరునామా",Marathi:"कंपनीचा पत्ता",Tamil:"நிறுவன முகவரி",Gujarati:"કंपanynu Saranamu",Kannada:"ಕಂಪನಿ ವಿಳಾಸ",Malayalam:"കമ്പനി മേൽവിലാസം",Punjabi:"ਕੰਪਨੀ ਦਾ ਪਤਾ",Odia:"କମ୍ପାନି ଠିକଣା"} },
    { id:"candidate_name",   label:"Candidate Name",            required:true, placeholder:"Full name",                labels:{Hindi:"उम्मीदवार का नाम",Bengali:"প্রার্থীর নাম",Telugu:"అభ్యర్థి పేరు",Marathi:"उमेदवाराचे नाव",Tamil:"விண்ணப்பதாரர் பெயர்",Gujarati:"ઉmedevarnु Naam",Kannada:"ಅಭ್ಯರ್ಥಿ ಹೆಸರು",Malayalam:"ഉദ്യോഗാർഥിയുടെ പേര്",Punjabi:"ਉਮੀਦਵਾਰ ਦਾ ਨਾਮ",Odia:"ଉମ୍ମେଦୱାର ନାମ"} },
    { id:"position",         label:"Position / Designation",    required:true, placeholder:"Software Engineer",        labels:{Hindi:"पद / पदनाम",Bengali:"পদ",Telugu:"పదవి",Marathi:"पद",Tamil:"பதவி",Gujarati:"Pad",Kannada:"ಹುದ್ದೆ",Malayalam:"തസ്തിക",Punjabi:"ਅਹੁਦਾ",Odia:"ପଦ"} },
    { id:"annual_ctc",       label:"Annual CTC (₹)",            required:true, placeholder:"600000", inputType:"number", labels:{Hindi:"वार्षिक सीटीसी (₹)",Bengali:"বার্ষিক CTC (₹)",Telugu:"వార్షిక CTC (₹)",Marathi:"वार्षिक CTC (₹)",Tamil:"ஆண்டு CTC (₹)",Gujarati:"Varshik CTC (₹)",Kannada:"ವಾರ್ಷಿಕ CTC (₹)",Malayalam:"വാർഷിക CTC (₹)",Punjabi:"ਸਾਲਾਨਾ CTC (₹)",Odia:"ବାର୍ଷିକ CTC (₹)"} },
    { id:"joining_date",     label:"Date of Joining",           required:true, placeholder:"", inputType:"date",       labels:{Hindi:"ज्वाइनिंग की तारीख",Bengali:"যোগদানের তারিখ",Telugu:"చేరే తేదీ",Marathi:"रुजू होण्याची तारीख",Tamil:"சேரும் தேதி",Gujarati:"Jodavani Tarikh",Kannada:"ಸೇರ್ಪಡೆ ದಿನಾಂಕ",Malayalam:"ചേരുന്ന തീയതി",Punjabi:"ਸ਼ਾਮਲ ਹੋਣ ਦੀ ਮਿਤੀ",Odia:"ଯୋଗ ତାରିଖ"} },
    { id:"probation_months", label:"Probation Period (months)", placeholder:"6", inputType:"number",                   labels:{Hindi:"परिवीक्षा अवधि (महीने)",Bengali:"পরীক্ষামূলক সময় (মাস)",Telugu:"ప్రొబేషన్ (నెలలు)",Marathi:"परिवीक्षा (महिने)",Tamil:"பரிசோதனை காலம் (மாதங்கள்)",Gujarati:"Probation (Mahina)",Kannada:"ಪ್ರೊಬೇಷನ್ (ತಿಂಗಳು)",Malayalam:"പ്രൊബേഷൻ (മാസം)",Punjabi:"ਪ੍ਰੋਬੇਸ਼ਨ (ਮਹੀਨੇ)",Odia:"ପ୍ରୋବେସନ (ମାସ)"} },
  ],
};

function formatDateForPdf(val: string) {
  if (!val) return val;
  const p = val.split("-");
  if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
  return val;
}

export default function LegalTemplates({ onClose, language = "English" }: Props) {
  const [templates, setTemplates]     = useState<Template[]>([]);
  const [selected, setSelected]       = useState<Template | null>(null);
  const [formData, setFormData]       = useState<Record<string, string>>({});
  const [generating, setGenerating]   = useState(false);
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [error, setError]             = useState("");

  const formLang = UI[language] ? language : "English";
  const ui = UI[formLang];
  const isNonEnglish = formLang !== "English";

  useEffect(() => {
    fetch(`${API}/api/documents/templates`)
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .catch(() => {});
  }, []);

  function set(k: string, v: string) { setFormData(prev => ({ ...prev, [k]: v })); }

  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true); setError("");
    try {
      const sendData: Record<string, string | number> = {};
      const flds = FIELDS[selected.id] ?? [];
      for (const [k, v] of Object.entries(formData)) {
        const field = flds.find(f => f.id === k);
        if (field?.inputType === "date") {
          sendData[k] = formatDateForPdf(v);
        } else if (field?.inputType === "number") {
          const n = Number(v.replace(/[,₹Rs.]/g, "").trim());
          sendData[k] = isNaN(n) ? 0 : n;
        } else {
          sendData[k] = v;
        }
      }
      sendData["_lang"] = formLang;

      let res;
      if (selected.id === "fir_draft") {
        res = await fetch(`${API}/api/documents/fir`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ user_data: sendData, proof_images: proofImages }),
        });
      } else {
        res = await fetch(`${API}/api/documents/templates/generate`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ template_id: selected.id, data: sendData, images: proofImages }),
        });
      }
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Generation failed"); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${selected.id.replace(/_/g,"-")}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally { setGenerating(false); }
  }

  const flds      = selected ? FIELDS[selected.id] ?? [] : [];
  const required  = flds.filter(f => f.required);
  const canGen    = required.every(f => formData[f.id]?.trim());

  const inputCls = `w-full rounded-xl px-3 py-2.5 text-[0.875rem] border focus:outline-none transition-all`;
  const iStyle   = { background:"var(--bg-3)", borderColor:"rgba(255,255,255,0.1)", color:"var(--text)" };
  const lblCls   = "text-[0.65rem] uppercase tracking-widest mb-1.5 block";
  const lStyle   = { color:"var(--text-3)" };

  function getLbl(f: FieldType) { return (f.labels && f.labels[formLang]) ? f.labels[formLang] : f.label; }

  function renderField(f: FieldType) {
    const label = getLbl(f);
    if (f.inputType === "textarea") return (
      <div key={f.id}>
        <label className={lblCls} style={lStyle}>{label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
        <textarea value={formData[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.placeholder} rows={4} className={`${inputCls} resize-none`} style={iStyle} />
      </div>
    );
    if (f.inputType === "select" && f.options) return (
      <div key={f.id}>
        <label className={lblCls} style={lStyle}>{label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
        <select value={formData[f.id]||""} onChange={e=>set(f.id,e.target.value)} className={inputCls} style={iStyle}>
          <option value="">— {ui.select} —</option>
          {f.options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
    if (f.inputType === "date") return (
      <div key={f.id}>
        <label className={lblCls} style={lStyle}>{label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
        <input type="date" value={formData[f.id]||""} onChange={e=>set(f.id,e.target.value)} className={inputCls} style={iStyle} />
      </div>
    );
    if (f.inputType === "number") return (
      <div key={f.id}>
        <label className={lblCls} style={lStyle}>{label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
        <input type="number" value={formData[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.placeholder} className={inputCls} style={iStyle} />
      </div>
    );
    return (
      <div key={f.id}>
        <label className={lblCls} style={lStyle}>{label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
        <input value={formData[f.id]||""} onChange={e=>set(f.id,e.target.value)} placeholder={f.placeholder} className={inputCls} style={iStyle} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{background:"var(--bg)"}}>
      <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{borderColor:"rgba(255,255,255,0.05)",background:"var(--bg-2)"}}>
        <div className="flex items-center gap-3">
          {selected && (
            <button onClick={()=>{setSelected(null);setFormData({});setError("");setProofImages([]);}}
              className="p-1.5 rounded-xl transition-colors" style={{color:"var(--text-3)"}}>
              <ChevronLeft size={16}/>
            </button>
          )}
          <div>
            <h2 className="font-display text-xl" style={{color:"var(--gold-light)"}}>📝 Legal Templates</h2>
            <p className="text-[0.72rem] mt-0.5" style={{color:"var(--text-3)"}}>
              {selected ? selected.title : "Ready-to-download legal documents"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selected && isNonEnglish && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.75rem] font-medium"
              style={{background:"rgba(255,153,0,0.12)",border:"1px solid rgba(255,153,0,0.35)",color:"#fbbf24"}}>
              <Languages size={13}/> {LANG_NAMES[formLang]??formLang}
            </div>
          )}
          <button onClick={onClose} className="p-2 rounded-xl" style={{color:"var(--text-3)"}}><X size={16}/></button>
        </div>
      </div>

      {!selected && (
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t,i)=>(
              <button key={t.id} onClick={()=>{setSelected(t);setFormData({});setProofImages([]);}}
                className="text-left p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] animate-fade-up"
                style={{background:"var(--bg-2)",borderColor:"rgba(255,255,255,0.07)",animationDelay:`${i*0.05}s`,opacity:0,animationFillMode:"forwards"}}>
                <span className="text-2xl block mb-2">{t.icon}</span>
                <p className="text-[0.85rem] font-medium mb-1" style={{color:"var(--text)"}}>{t.title}</p>
                <p className="text-[0.72rem] leading-relaxed" style={{color:"var(--text-3)"}}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-[0.8rem]"
              style={{background:"rgba(127,29,29,0.2)",border:"1px solid rgba(239,68,68,0.3)",color:"#fca5a5"}}>
              {error}
            </div>
          )}
          {isNonEnglish && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-[0.78rem]"
              style={{background:"rgba(255,153,0,0.07)",border:"1px solid rgba(255,153,0,0.25)",color:"#fbbf24"}}>
              🌐 <span>{ui.modeOn} — {LANG_NAMES[formLang]}</span>
            </div>
          )}

          {flds.map(renderField)}

          <div className="space-y-2">
            <label className={`${lblCls} flex items-center gap-1`} style={lStyle}>
              📎 {ui.attach}
            </label>
            <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer hover:opacity-90"
              style={{background:"var(--bg-3)",border:"1px solid var(--border)"}}>
              <span className="text-base">📷</span>
              <span className="text-[0.82rem]" style={{color:"var(--text-2)"}}>{ui.add}</span>
              <input type="file" className="hidden" accept="image/*" multiple
                onChange={async(e)=>{
                  const files=Array.from(e.target.files||[]);
                  const b64s=await Promise.all(files.map(f=>new Promise<string>((res)=>{
                    const r=new FileReader(); r.onload=()=>res(r.result as string); r.readAsDataURL(f);
                  })));
                  setProofImages(prev=>[...prev,...b64s]); e.target.value="";
                }}/>
            </label>
            {proofImages.length>0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {proofImages.map((img,i)=>(
                  <div key={i} className="relative">
                    <img src={img} alt={`Proof ${i+1}`} className="w-16 h-16 object-cover rounded-lg border" style={{borderColor:"var(--border-md)"}}/>
                    <button onClick={()=>setProofImages(prev=>prev.filter((_,j)=>j!==i))}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[0.6rem] flex items-center justify-center"
                      style={{background:"var(--danger)",color:"#fff"}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 pb-4">
            <button onClick={handleGenerate} disabled={!canGen||generating}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{background:canGen&&!generating?"linear-gradient(135deg,var(--gold),#b45309)":"var(--bg-4)",color:canGen&&!generating?"#000":"var(--text-3)"}}>
              {generating
                ? <><Loader2 size={14} className="animate-spin"/> {ui.generating}</>
                : <><Download size={14}/> {ui.download} {selected.title}</>}
            </button>
            {!canGen && <p className="text-[0.68rem] text-center mt-2" style={{color:"var(--text-3)"}}>{ui.fill}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
