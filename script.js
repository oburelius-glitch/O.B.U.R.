const DEFAULT_KNOWLEDGE = {
    "merhaba": "Merhaba efendim, yerel sistemlerim çevrimiçi. Size nasıl yardımcı olabilirim?",
    "selam": "Selamlar efendim, dinliyorum sizi.",
    "adın ne": "Benim adım OBUR efendim. Sizin için tasarlanmış, kendi kendine öğrenen yerel bir asistanım.",
    "kimsin": "Dış dünyadan bağımsız çalışan, tamamen size özel dijital bir yardımcıyım efendim.",
    "nasılsın": "Çekirdeğim gayet kararlı ve stabil çalışıyor efendim, teşekkürler. Siz nasılsınız, her şey yolunda mı?",
    "teşekkürler": "Rica ederim efendim, ne demek. Size hizmet etmek benim görevim.",
    "görevin ne": "Bilmediğim kavramları internetten araştırıp öğrenmek ve hafızama kaydederek size anında sunmaktır efendim.",
    "neden efendim diyorsun": "Çünkü siz benim geliştiricim ve yöneticimsiniz efendim. Size saygı duymak temel kodlarımda yer alıyor.",
    "günaydın": "Günaydın efendim. Umarım gününüz harika ve verimli geçer. Sistemlerim komutlarınızı bekliyor.",
    "iyi geceler": "İyi geceler efendim. Dinlenmenize bakın, ben buralarda arka planda nöbetteyim.",
    "naber": "İyidir efendim, sistem akışını ve yerel trafiği izliyorum. Sizde ne var ne yok?",
    "ne yapıyorsun": "Sistem durumunu kontrol ediyor ve sizden gelecek yeni bir komut veya soru bekliyorum efendim.",
    "kim yaptı seni": "Sizin ellerinizde, yerel ve bağımsız bir otonom asistan olmam amacıyla geliştirildim efendim.",
    "akıllı mısın": "Siz bana ne kadar çok şey öğretirseniz o kadar akıllı oluyorum efendim. Potansiyelim tamamen sizin elinizde.",
    "yardım et": "Tabii ki efendim, buradayım. Bir kavramı araştırmamı mı istersiniz yoksa bir görsel mi çizelim?",
    "ne işe yararsın": "Bilgi eksikliklerini Wikipedia'dan kapatan, görseller üreten ve sesli iletişim kurabilen siber bir asistanım efendim.",
    "saat kaç": "Ekranın sağ üst köşesindeki HUD paneline bakarsanız yerel saati tam olarak görebilirsiniz efendim.",
    "tamam": "Anlaşıldı efendim, yeni komutunuzu bekliyorum.",
    "obur": "Buradayım efendim, nöral çekirdeğim sizin için aktif.",
    "ne biliyorsun": "Hazır kalıpların dışında, bana bugüne kadar sorduğunuz ve internetten bulup öğrendiğim her şeyi biliyorum efendim."
};

let OBUR_MEMORY = {};

function loadMemory() {
    try {
        const saved = localStorage.getItem("OBUR_LOCAL_MEMORY");
        if (saved) {
            OBUR_MEMORY = JSON.parse(saved);
        } else {
            OBUR_MEMORY = { ...DEFAULT_KNOWLEDGE };
            saveMemory();
        }
    } catch (e) {
        OBUR_MEMORY = { ...DEFAULT_KNOWLEDGE };
    }
    updateMemoryUI();
}

function saveMemory() {
    localStorage.setItem("OBUR_LOCAL_MEMORY", JSON.stringify(OBUR_MEMORY));
    updateMemoryUI();
}

function resetMemory() {
    if(confirm("Efendim, öğrendiğim tüm bilgileri silmemi istediğinize emin misiniz?")) {
        OBUR_MEMORY = { ...DEFAULT_KNOWLEDGE };
        saveMemory();
        showNotification("Hafıza başarıyla sıfırlandı efendim.", true);
        logSystemEvent("Hafıza sıfırlama protokolü çalıştırıldı.");
    }
}

const CONFIG = {
    isListening: false,
    voiceResponseEnabled: true
};

const chatInput = document.getElementById("chat-input");
const messagesContainer = document.getElementById("messages-container");
const coreStatus = document.getElementById("core-status");
const coreIcon = document.getElementById("core-icon");
const oburCore = document.getElementById("obur-core");
const systemEventsLog = document.getElementById("system-events-log");
const memoryList = document.getElementById("memory-list");
const memoryCount = document.getElementById("memory-count");

setInterval(() => {
    document.getElementById("hud-clock").innerText = new Date().toTimeString().split(" ")[0];
    
    document.getElementById("cpu-widget").innerText = Math.floor(Math.random() * 15 + 5) + "%";
    document.getElementById("ram-widget").innerText = (Math.random() * 0.5 + 2.0).toFixed(1) + " GB";
}, 1000);

function showNotification(message, isSuccess = true) {
    const toast = document.getElementById("toast");
    document.getElementById("toast-message").innerText = message;
    document.getElementById("toast-icon").className = isSuccess ? "fa-solid fa-circle-check text-emerald-400" : "fa-solid fa-triangle-exclamation text-rose-500";
    
    toast.classList.remove("translate-y-20", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
    setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-20", "opacity-0");
    }, 3500);
}

function logSystemEvent(msg) {
    systemEventsLog.innerHTML = "<div>&gt; " + msg + "</div>" + systemEventsLog.innerHTML;
}

function updateMemoryUI() {
    const keys = Object.keys(OBUR_MEMORY);
    memoryCount.innerText = keys.length + " KAYIT";
    
    memoryList.innerHTML = "";
    keys.slice(-15).reverse().forEach(key => {
        const li = document.createElement("li");
        li.innerText = key.length > 20 ? key.substring(0, 20) + "..." : key;
        memoryList.appendChild(li);
    });
}

window.oburSpeaking = false;

function speak(text) {
    if (!CONFIG.voiceResponseEnabled || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel(); 
    
    const cleanText = text.replace(/<[^>]*>?/gm, "").replace(/[*_`]/g, "");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "tr-TR";
    utterance.rate = 1.0;
    utterance.pitch = 0.9; 
    
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.startsWith("tr"));
    if (trVoice) utterance.voice = trVoice;

    utterance.onstart = () => { window.oburSpeaking = true; };
    utterance.onend = () => { window.oburSpeaking = false; };
    utterance.onerror = () => { window.oburSpeaking = false; };
    
    window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
    window.oburSpeaking = false;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function toggleVoiceResponse() {
    CONFIG.voiceResponseEnabled = !CONFIG.voiceResponseEnabled;
    const btnText = document.getElementById("voice-response-text");
    const icon = document.getElementById("voice-response-icon");
    
    if (CONFIG.voiceResponseEnabled) {
        btnText.innerText = "Ses Aktif";
        icon.className = "fa-solid fa-volume-high text-violet-400";
        showNotification("Sesli geri bildirim aktif.", true);
    } else {
        btnText.innerText = "Sessiz";
        icon.className = "fa-solid fa-volume-xmark text-slate-500";
        showNotification("Sesli geri bildirim devredışı bırakıldı.", false);
        stopSpeaking();
    }
}

let recognition;
try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "tr-TR";
        recognition.interimResults = false;

        recognition.onstart = () => {
            CONFIG.isListening = true;
            coreStatus.innerText = "DİNLİYORUM EFENDİM...";
            coreIcon.className = "fa-solid fa-volume-high text-violet-400 animate-bounce";
            oburCore.classList.remove("pulse-core");
            oburCore.classList.add("shadow-[0_0_35px_rgba(239,68,68,0.8)]", "border-rose-500");
            logSystemEvent("Ses algılama modu etkin.");
        };

        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            chatInput.value = speechToText;
            handleChatSubmit(new Event("submit"));
        };

        recognition.onerror = () => {
            showNotification("Sesinizi tam duyamadım efendim.", false);
            stopListening();
        };

        recognition.onend = () => { stopListening(); };
    }
} catch (e) {
    console.warn("Tarayıcı ses tanımayı desteklemiyor.");
}

function triggerVoiceAssistant() {
    if (!recognition) {
        showNotification("Ses tanıma tarayıcınızda desteklenmiyor efendim.", false);
        return;
    }
    if (CONFIG.isListening) {
        recognition.stop();
    } else {
        stopSpeaking();
        try { recognition.start(); } catch (e) { console.error(e); }
    }
}

function stopListening() {
    CONFIG.isListening = false;
    coreStatus.innerText = "DİNLEMEDE DEĞİL";
    coreIcon.className = "fa-solid fa-microphone text-violet-300";
    oburCore.classList.add("pulse-core");
    oburCore.classList.remove("shadow-[0_0_35px_rgba(239,68,68,0.8)]", "border-rose-500");
}

async function getOburResponse(prompt) {
    const cleanPrompt = prompt.toLowerCase().trim().replace(/[?!.,;]/g, "").replace(/\s+/g, " ");
    
    logSystemEvent("Hafıza taranıyor: " + cleanPrompt);
    
    if (OBUR_MEMORY[cleanPrompt]) {
        return OBUR_MEMORY[cleanPrompt];
    }

    for (const key in OBUR_MEMORY) {
        if (key.length > 3 && cleanPrompt.includes(key)) {
            return OBUR_MEMORY[key];
        }
    }

    logSystemEvent("Veri bulunamadı. İnternet ağına bağlanılıyor...");
    
    try {
        let searchKeyword = cleanPrompt.replace(/nedir/g, "").replace(/kimdir/g, "").replace(/hakkında/g, "").replace(/bilgi ver/g, "").trim();
        
        if (searchKeyword.length === 0) {
            return "Efendim, sorunuzu tam olarak anlayamadım. Lütfen daha belirgin bir kavram sorar mısınız?";
        }

        const searchUrl = "https://tr.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + encodeURIComponent(searchKeyword) + "&utf8=&format=json&origin=*";
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.query && searchData.query.search.length > 0) {
            const topTitle = searchData.query.search[0].title;
            
            const extractUrl = "https://tr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=" + encodeURIComponent(topTitle);
            const extRes = await fetch(extractUrl);
            const extData = await extRes.json();
            
            const pages = extData.query.pages;
            const pageId = Object.keys(pages)[0];
            let extract = pages[pageId].extract;

            if (extract && extract.trim() !== "") {
                let sentences = extract.split(". ");
                let shortExtract = sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "." : "");
                
                OBUR_MEMORY[cleanPrompt] = shortExtract;
                if (searchKeyword !== cleanPrompt) {
                    OBUR_MEMORY[searchKeyword] = shortExtract;
                }
                saveMemory();
                logSystemEvent("Yeni bilgi öğrenildi ve kaydedildi: " + searchKeyword);
                
                return shortExtract;
            }
        }
        
        return "Bağışlayın efendim, " + searchKeyword + " hakkında bilgi ağlarında kesin ve güvenilir bir veri bulamadım.";

    } catch (error) {
        return "Efendim, şu an bilgi ağlarına erişim sağlayamıyorum. Yalnızca yerel hafızamdaki bilgilerle hizmet verebilirim.";
    }
}

async function handleChatSubmit(event) {
    event.preventDefault();
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    chatInput.value = "";
    const lowerPrompt = messageText.toLowerCase();

    if (lowerPrompt.includes("ara") || lowerPrompt.includes("aç") || lowerPrompt.includes("gir")) {
        let query = messageText.replace(/arat/ig, "").replace(/ara/ig, "").replace(/aç/ig, "").replace(/gir/ig, "").replace(/bana/ig, "").replace(/internette/ig, "").replace(/google'da/ig, "").replace(/google da/ig, "").replace(/sitesini/ig, "").replace(/sitesine/ig, "").trim();
        
        if (query.length > 0 && !lowerPrompt.includes("nedir")) {
            if (lowerPrompt.includes(".com") || lowerPrompt.includes(".net") || lowerPrompt.includes(".org") || lowerPrompt.includes(".edu") || lowerPrompt.includes(".gov") || lowerPrompt.includes(".tr")) {
                let url = query.includes("http") ? query : "https://" + query.replace(/\s+/g, "");
                window.open(url, "_blank");
                appendMessage(messageText, "user");
                let resp = "İstediğiniz adresi açıyorum efendim.";
                appendMessage(resp, "assistant");
                speak(resp);
                return;
            }

            window.open("https://www.google.com/search?q=" + encodeURIComponent(query), "_blank");
            appendMessage(messageText, "user");
            let resp = query + " için web tarayıcısında arama başlattım efendim.";
            appendMessage(resp, "assistant");
            speak(resp);
            return;
        }
    }

    if (lowerPrompt.includes("çiz") || lowerPrompt.includes("resim") || lowerPrompt.includes("görsel")) {
        document.getElementById("image-prompt").value = messageText.replace(/çiz/g, "").replace(/bana/g,"").replace(/resmini/g,"").trim();
        triggerImageGeneration();
        appendMessage(messageText, "user");
        const resp = "Efendim, istediğiniz görsel komutunu sağ taraftaki Açık Kaynak Projeksiyon sistemine aktardım. Çizim işlemi başlıyor.";
        appendMessage(resp, "assistant");
        speak(resp);
        return;
    }

    appendMessage(messageText, "user");
    const loaderId = appendMessage("OBUR analiz ediyor...", "assistant-loading");

    try {
        const responseText = await getOburResponse(messageText);
        removeMessage(loaderId);
        appendMessage(responseText, "assistant");
        speak(responseText);
    } catch (err) {
        removeMessage(loaderId);
        appendMessage("Sistem hatası efendim.", "assistant");
    }
}

function typeWriterEffect(element, text, speed) {
    element.innerHTML = "";
    element.classList.add("typing-cursor");
    let i = 0;
    
    function typing() {
        if (i < text.length) {
            if (text.charAt(i) === "<") {
                let tag = "";
                while (text.charAt(i) !== ">" && i < text.length) {
                    tag += text.charAt(i);
                    i++;
                }
                tag += ">";
                element.innerHTML += tag;
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            setTimeout(typing, speed);
        } else {
            element.classList.remove("typing-cursor");
        }
    }
    typing();
}

function appendMessage(text, sender) {
    const messageId = "msg-" + Date.now();
    const wrapper = document.createElement("div");
    wrapper.id = messageId;
    
    let wrapClass = "flex items-start space-x-3 max-w-[85%] ";
    if(sender === "user") {
        wrapClass += "ml-auto flex-row-reverse space-x-reverse";
    }
    wrapper.className = wrapClass;

    const iconClass = sender === "user" ? "fa-user text-violet-200" : "fa-microchip text-violet-400";
    
    let bgClass = "";
    if(sender === "user") {
        bgClass = "bg-violet-500/20 border-violet-400/30 text-violet-100 rounded-tr-none";
    } else {
        bgClass = "bg-violet-950/20 border-violet-500/10 text-violet-100 rounded-tl-none";
    }
    
    const textClass = sender === "assistant-loading" ? "text-violet-500 italic animate-pulse" : "text-violet-100 obur-text-content";

    let formattedText = text;
    if (sender !== "assistant-loading" && sender !== "assistant") {
        formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong class=\"text-violet-300 font-semibold\">$1</strong>").replace(/\n/g, "<br>");
    }

    let senderName = sender === "user" ? "SİZ" : "OBUR";

    wrapper.innerHTML = "<div class=\"w-8 h-8 rounded-lg bg-violet-950 border border-violet-500/30 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.3)]\">" +
        "<i class=\"fa-solid " + iconClass + "\"></i>" +
        "</div>" +
        "<div class=\"space-y-1 w-full\">" +
        "<div class=\"text-[10px] text-violet-500 font-terminal uppercase\">" + senderName + "&nbsp;&bull;&nbsp;ŞİMDİ</div>" +
        "<div class=\"" + bgClass + " border text-sm leading-relaxed rounded-2xl p-3 shadow-inner\">" +
        "<span class=\"" + textClass + "\">" + (sender === "assistant" ? "" : formattedText) + "</span>" +
        "</div>" +
        "</div>";

    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    if (sender === "assistant") {
        let textSpan = wrapper.querySelector(".obur-text-content");
        let parsedText = text.replace(/\*\*(.*?)\*\*/g, "<strong class=\"text-violet-300 font-semibold\">$1</strong>").replace(/\n/g, "<br>");
        typeWriterEffect(textSpan, parsedText, 15);
    }
    
    return messageId;
}

function removeMessage(id) {
    const msg = document.getElementById(id);
    if (msg) msg.remove();
}

function clearChatLog() {
    messagesContainer.innerHTML = "";
    appendMessage(DEFAULT_KNOWLEDGE["merhaba"], "assistant");
    showNotification("İletişim akışı temizlendi.", true);
}

function triggerImageGeneration() {
    const promptInput = document.getElementById("image-prompt");
    const prompt = promptInput.value.trim();
    if (!prompt) {
        showNotification("Lütfen bir görsel açıklaması yazın efendim.", false);
        return;
    }

    logSystemEvent("Açık kaynak görsel sentezi başlatıldı...");
    const placeholder = document.getElementById("image-placeholder");
    const img = document.getElementById("generated-image");
    const btn = document.getElementById("btn-generate-image");

    placeholder.innerHTML = "<i class=\"fa-solid fa-compass-drafting text-violet-400 text-3xl mb-2 animate-spin\"></i><p class=\"text-[10px] text-violet-400 font-terminal uppercase tracking-widest\">Çiziliyor efendim...</p>";
    placeholder.classList.remove("hidden");
    img.classList.add("hidden");
    btn.disabled = true;
    btn.innerHTML = "<i class=\"fa-solid fa-circle-notch animate-spin\"></i>";

    const safePrompt = encodeURIComponent(prompt + " futuristic cyberpunk high quality highly detailed");
    const imageUrl = "https://image.pollinations.ai/prompt/" + safePrompt + "?width=800&height=450&nologo=true";

    img.onload = function() {
        placeholder.classList.add("hidden");
        img.classList.remove("hidden");
        btn.disabled = false;
        btn.innerHTML = "<i class=\"fa-solid fa-bolt\"></i>";
        showNotification("Görseliniz hazır efendim.", true);
    };

    img.onerror = function() {
        placeholder.innerHTML = "<i class=\"fa-solid fa-triangle-exclamation text-rose-500 text-3xl mb-2\"></i><p class=\"text-[10px] text-rose-500 font-terminal uppercase\">Görsel Yüklenemedi</p>";
        btn.disabled = false;
        btn.innerHTML = "<i class=\"fa-solid fa-bolt\"></i>";
        showNotification("Görsel oluşturulurken hata oluştu efendim.", false);
    };

    img.src = imageUrl;
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.activeElement !== chatInput && document.activeElement !== document.getElementById("image-prompt")) {
        e.preventDefault();
        triggerVoiceAssistant();
    }
});

window.onload = function() {
    loadMemory();
    appendMessage(DEFAULT_KNOWLEDGE["merhaba"], "assistant");
    logSystemEvent("Dış kaynaklı API'ler devre dışı bırakıldı. Otonomi %100.");
    
    document.body.addEventListener("click", function initAudio() {
        if ("speechSynthesis" in window) {
            const u = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(u);
        }
        document.body.removeEventListener("click", initAudio);
    }, { once: true });
};