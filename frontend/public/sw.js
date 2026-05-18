const CACHE_NAME  = "nyay-sahayak-v1";
const LEGAL_CACHE = "nyay-legal-data-v1";

const OFFLINE_LEGAL_INFO = {
  emergency: {
    title: "Emergency Contacts",
    content: [
      { label: "Police Emergency",     number: "100" },
      { label: "Women Helpline",       number: "1091" },
      { label: "Domestic Violence",    number: "181" },
      { label: "All Emergencies",      number: "112" },
      { label: "Free Legal Aid (NALSA)", number: "1800-110-370" },
      { label: "Tele-Law",             number: "1800-120-1075" },
      { label: "Child Helpline",       number: "1098" },
      { label: "Senior Citizen",       number: "14567" },
    ]
  },
  rights: {
    en: [
      { title: "Right to Silence",      body: "You cannot be compelled to witness against yourself (Article 20). Stay silent when arrested." },
      { title: "Right to a Lawyer",     body: "Section 41D BNSS: right to meet a lawyer during interrogation. Police cannot deny this." },
      { title: "24-Hour Rule",          body: "Police must produce you before a magistrate within 24 hours of arrest (Article 22)." },
      { title: "Zero FIR",              body: "File an FIR at ANY police station regardless of jurisdiction. They must register and forward it." },
      { title: "Domestic Violence",     body: "Protection orders available under DV Act 2005. Call Women Helpline: 181." },
      { title: "Free Legal Aid",        body: "Income below ₹1 lakh/year? Free representation available. NALSA: 1800-110-370." },
    ],
    hi: [
      { title: "चुप रहने का अधिकार",    body: "गिरफ्तारी पर आपको बयान देने के लिए मजबूर नहीं किया जा सकता (अनुच्छेद 20)।" },
      { title: "वकील का अधिकार",        body: "धारा 41D BNSS: पूछताछ के दौरान वकील से मिलने का अधिकार है। पुलिस मना नहीं कर सकती।" },
      { title: "24 घंटे का नियम",       body: "गिरफ्तारी के 24 घंटे के भीतर मजिस्ट्रेट के सामने पेश करना जरूरी है (अनुच्छेद 22)।" },
      { title: "जीरो FIR",              body: "किसी भी पुलिस थाने में FIR दर्ज करवाएं, चाहे घटना कहीं भी हुई हो।" },
      { title: "घरेलू हिंसा",           body: "DV Act 2005 के तहत सुरक्षा आदेश मिल सकता है। महिला हेल्पलाइन: 181।" },
      { title: "मुफ्त कानूनी सहायता",    body: "₹1 लाख से कम आय? मुफ्त वकील मिलेगा। NALSA: 1800-110-370।" },
    ],
    bn: [
      { title: "নীরব থাকার অধিকার",     body: "গ্রেফতারের সময় আপনাকে সাক্ষ্য দিতে বাধ্য করা যাবে না (অনুচ্ছেদ 20)।" },
      { title: "আইনজীবীর অধিকার",       body: "BNSS ধারা 41D: জিজ্ঞাসাবাদের সময় আইনজীবীর সাথে দেখা করার অধিকার আছে।" },
      { title: "২৪ ঘণ্টার নিয়ম",        body: "গ্রেফতারের ২৪ ঘণ্টার মধ্যে ম্যাজিস্ট্রেটের সামনে হাজির করতে হবে।" },
      { title: "জিরো FIR",               body: "যেকোনো থানায় FIR করুন, এলাকা যাই হোক। তারা নথিভুক্ত করতে বাধ্য।" },
      { title: "গৃহহিংসা সুরক্ষা",       body: "DV Act 2005 এর অধীনে সুরক্ষা আদেশ পাওয়া যায়। মহিলা হেল্পলাইন: 181।" },
      { title: "বিনামূল্যে আইনি সাহায্য", body: "আয় ₹১ লাখের কম? বিনামূল্যে আইনজীবী পাবেন। NALSA: 1800-110-370।" },
    ],
    te: [
      { title: "మౌనంగా ఉండే హక్కు",     body: "అరెస్టు సమయంలో మీరు సాక్ష్యం ఇవ్వమని బలవంతపెట్టలేరు (అనుచ్ఛేదం 20)." },
      { title: "న్యాయవాది హక్కు",        body: "BNSS సెక్షన్ 41D: విచారణ సమయంలో న్యాయవాదిని కలవడానికి హక్కు ఉంది." },
      { title: "24 గంటల నియమం",         body: "అరెస్టు నుండి 24 గంటల్లో మేజిస్ట్రేట్ ముందు హాజరుపరచాలి." },
      { title: "జీరో FIR",               body: "ఏ పోలీస్ స్టేషన్‌లోనైనా FIR దాఖలు చేయవచ్చు, అధికార పరిధి వేరైనా." },
      { title: "గృహహింస సంరక్షణ",        body: "DV Act 2005 కింద రక్షణ ఆదేశాలు పొందవచ్చు. మహిళా హెల్ప్‌లైన్: 181." },
      { title: "ఉచిత న్యాయ సహాయం",       body: "ఆదాయం ₹1 లక్ష కంటే తక్కువైతే? ఉచిత న్యాయవాది. NALSA: 1800-110-370." },
    ],
    ta: [
      { title: "மௌன உரிமை",            body: "கைது நேரத்தில் சாட்சியமளிக்க கட்டாயப்படுத்த முடியாது (சட்டப்பிரிவு 20)." },
      { title: "வழக்கறிஞர் உரிமை",      body: "BNSS பிரிவு 41D: விசாரணையின்போது வழக்கறிஞரை சந்திக்க உரிமை உண்டு." },
      { title: "24 மணி நேர விதி",       body: "கைதானதிலிருந்து 24 மணி நேரத்தில் நீதிபதி முன் ஆஜர்படுத்த வேண்டும்." },
      { title: "ஜீரோ FIR",              body: "எந்த காவல் நிலையத்திலும் FIR பதிவு செய்யலாம், அதிகார வரம்பு எதுவாக இருந்தாலும்." },
      { title: "குடும்ப வன்முறை பாதுகாப்பு", body: "DV சட்டம் 2005 கீழ் பாதுகாப்பு உத்தரவு பெறலாம். பெண்கள் உதவி: 181." },
      { title: "இலவச சட்ட உதவி",        body: "வருமானம் ₹1 லட்சத்திற்கும் குறைவா? NALSA: 1800-110-370." },
    ],
  }
};

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(LEGAL_CACHE).then(cache =>
      cache.put("/offline-legal-data", new Response(JSON.stringify(OFFLINE_LEGAL_INFO), {
        headers: { "Content-Type": "application/json" }
      }))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== LEGAL_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;

  // Never cache API calls
  if (url.pathname.startsWith("/api/") || url.hostname !== location.hostname) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: "offline" }), {
          status: 503, headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  if (url.pathname === "/offline-legal-data") {
    event.respondWith(caches.match("/offline-legal-data").then(r => r || fetch(event.request)));
    return;
  }

  // Static assets — cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => cached || new Response("Offline", { status: 503 }));
    })
  );
});
