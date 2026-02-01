import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Stars, MailOpen, Mail, Gift, Sparkles,
  RefreshCw, Volume2, MessageCircle, Smile, Coffee,
  Frown, Send, History, Trash2, X, Moon, Thermometer,
  Zap, Sun, HeartHandshake, Utensils, PenLine, CheckCircle2,
  HelpCircle, Trophy, Camera, Upload, ImageIcon, Droplets, BatteryMedium, Cloud,
  Globe
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

/**
 * CONFIGURAÇÃO DO AMBIENTE
 */
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
if (Object.keys(firebaseConfig).length === 0) {
  console.warn("Firebase config is empty. Some features will not work.");
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'meu-projeto-amor';

// Translations Object
const translations = {
  pt: {
    trophy: "arquivo de amor eterno",
    title: "O Nosso Caminho",
    checkinTitle: "Check-in de Carinho ✨",
    mood: "Como estás hoje?",
    battery: "Bateria",
    food: "Comida",
    water: "Água",
    missing: "Saudades",
    highlight: "Destaque do dia",
    highlightPlaceholder: "Conta-me o que houve de bom...",
    submit: "Guardar Memória de Hoje",
    listen: "Ouvir Mensagem",
    openLetter: "ABRIR CARTA",
    closeLetter: "FECHAR",
    letterText: "Nossa jornada começou em 12/03/2025. Cada dia ao teu lado é um presente que guardo para sempre.",
    letterLove: "Amo-te! ❤️",
    portraitTitle: "Nosso Retrato IA (Arquivado)",
    generatePortrait: "Gerar Retrato IA para o Álbum",
    archiveTitle: "Arquivo de Memórias",
    days: "Dias", hours: "Horas", minutes: "Minutos", seconds: "Segundos",
    moods: ['Feliz', 'Cansada', 'Saudades', 'Ansiosa'],
    batteries: ['Baixa 🪫', 'Metade 🔋', 'Cheia ⚡'],
    foods: ['Boa', 'Ótima', 'Não comi'],
    waters: ['Sim! 💧', 'Ainda não'],
    missings: ['Mínimo', 'Muito', 'Demais', 'Imenso', 'Infinito'],
    aiPrompt: "Namorada check-in: Humor {mood}, Comida {food}, Água {water}, Saudades {missing}, Bateria {battery}. Destaque: {highlight}. Responde fofo em Português.",
    aiSystem: "És o namorado mais carinhoso. Resposta curta em Português.",
    voicePrompt: "Diz fofamente em Português: {text}",
    download: "Baixar Imagem"
  },
  th: {
    trophy: "บันทึกรักนิรันดร์",
    title: "เส้นทางรักของเรา",
    checkinTitle: "เช็คอินความรู้สึก ✨",
    mood: "วันนี้เป็นไงบ้าง?",
    battery: "พลังงาน",
    food: "อาหาร",
    water: "น้ำ",
    missing: "ความคิดถึง",
    highlight: "เรื่องเด่นวันนี้",
    highlightPlaceholder: "บอกหน่อยว่ามีอะไรดีๆ บ้าง...",
    submit: "บันทึกความทรงจำวันนี้",
    listen: "ฟังข้อความ",
    openLetter: "เปิดจดหมาย",
    closeLetter: "ปิด",
    letterText: "การเดินทางของเราเริ่มเมื่อ 12/03/2025 ทุกวันที่อยู่กับเธอคือของขวัญที่ฉันจะเก็บรักษาไว้ตลอดไป",
    letterLove: "รักนะ จุ๊บๆ! ❤️",
    portraitTitle: "ภาพวาด AI ของเรา (เก็บถาวร)",
    generatePortrait: "สร้างภาพวาด AI เข้าอัลบั้ม",
    archiveTitle: "คลังความทรงจำ",
    days: "วัน", hours: "ชั่วโมง", minutes: "นาที", seconds: "วินาที",
    moods: ['มีความสุข', 'เหนื่อย', 'คิดถึง', 'กังวล'],
    batteries: ['ต่ำ 🪫', 'ครึ่งหนึ่ง 🔋', 'เต็มเปี่ยม ⚡'],
    foods: ['อร่อย', 'ดีมาก', 'ยังไม่ได้กิน'],
    waters: ['ดื่มแล้ว! 💧', 'ยังเลย'],
    missings: ['นิดหน่อย', 'มาก', 'มากๆ', 'ที่สุด', 'ไม่มีที่สิ้นสุด'],
    aiPrompt: "แฟนสาวเช็คอิน: อารมณ์ {mood}, อาหาร {food}, น้ำ {water}, ความคิดถึง {missing}, พลังงาน {battery}. ไฮไลท์: {highlight}. ตอบกลับน่ารักๆ เป็นภาษาไทย",
    aiSystem: "คุณเป็นแฟนหนุ่มที่น่ารักที่สุด ตอบกลับสั้นๆ หวานๆ เป็นภาษาไทย",
    voicePrompt: "พูดด้วยน้ำเสียงน่ารักๆ เป็นภาษาไทย: {text}",
    download: "ดาวน์โหลดรูปภาพ"
  }
};

export default function App() {
  const [language, setLanguage] = useState('th'); // Default to Thai
  const t = translations[language];

  const [user, setUser] = useState(null);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showAdmin, setShowAdmin] = useState(false);
  const [interactions, setInteractions] = useState([]);

  // Estados Gemini
  const [moodResponse, setMoodResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Estados para o Retrato Mágico
  const [photo1, setPhoto1] = useState(null);
  const [photo2, setPhoto2] = useState(null);
  const [generatedPortrait, setGeneratedPortrait] = useState(null);
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

  // Estados para o Check-in Plus
  const [answers, setAnswers] = useState({
    mood: '', food: '', water: '', missing: '', battery: '', highlight: ''
  });

  const audioRef = useRef(null);
  const apiKey = "AIzaSyCV713q6bD-2IKgpyaG3vU7H8JrrCqHqQ4";

  const startDate = new Date('2025-03-12T00:00:00');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth Error:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    try {
      const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'interactions');
      const unsubscribe = onSnapshot(logsRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInteractions(data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
      }, (err) => console.error("Erro Cloud Sync:", err));
      return () => unsubscribe();
    } catch (e) { console.error("Firestore Init Error:", e); }
  }, [user]);

  useEffect(() => {
    const heartInterval = setInterval(() => {
      const newHeart = {
        id: Date.now(),
        left: Math.random() * 100,
        size: Math.random() * (40 - 15) + 15,
        duration: Math.random() * (12 - 6) + 6,
        delay: Math.random() * 2
      };
      setHearts((prev) => [...prev.slice(-25), newHeart]);
    }, 700);

    const timeInterval = setInterval(() => {
      const now = new Date();
      const diff = now - startDate;
      setTimeTogether({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => { clearInterval(heartInterval); clearInterval(timeInterval); };
  }, []);

  const compressImage = (base64Str, maxWidth = 400) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str.startsWith('data:') ? base64Str : `data:image/png;base64,${base64Str}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6).split(',')[1]);
      };
    });
  };

  const downloadImage = (base64Str) => {
    const link = document.createElement('a');
    link.href = base64Str;
    link.download = `retrato-amor-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const logInteraction = async (type, content, extraData = {}) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'interactions'), {
        type, content: content || "Sem conteúdo", ...extraData, timestamp: serverTimestamp(), userId: user.uid
      });
    } catch (e) { console.error("Erro ao arquivar:", e); }
  };

  const callGemini = async (payload, endpoint = 'generateContent', model = 'gemini-2.0-flash', retries = 0) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (response.status === 429 && retries < 5) {
          await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
          return callGemini(payload, endpoint, model, retries + 1);
        }
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Details:", errorData);
        throw new Error(`Erro API: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      if (retries < 5) {
        await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
        return callGemini(payload, endpoint, model, retries + 1);
      }
      console.error("Final API Error:", err);
      throw err;
    }
  };

  const generatePortrait = async () => {
    if (!photo1 || !photo2) return;
    setIsGeneratingPortrait(true);
    setGeneratedPortrait(null);
    try {
      const reader1 = new FileReader();
      const b64_1_raw = await new Promise(res => { reader1.onload = () => res(reader1.result.split(',')[1]); reader1.readAsDataURL(photo1); });
      const reader2 = new FileReader();
      const b64_2_raw = await new Promise(res => { reader2.onload = () => res(reader2.result.split(',')[1]); reader2.readAsDataURL(photo2); });

      const result = await callGemini({
        contents: [{
          parts: [
            { text: "Act as a master digital artist. Create a beautiful, romantic artistic digital painting of these two people together. Output ONLY the image." },
            { inlineData: { mimeType: photo1.type, data: b64_1_raw } },
            { inlineData: { mimeType: photo2.type, data: b64_2_raw } }
          ]
        }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      }, 'generateContent', 'gemini-2.0-flash');

      const imageB64 = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (imageB64) {
        const compP = await compressImage(imageB64, 500);
        const compO1 = await compressImage(b64_1_raw, 300);
        const compO2 = await compressImage(b64_2_raw, 300);
        setGeneratedPortrait(`data:image/png;base64,${compP}`);
        logInteraction('RETRATO_IA_COMPLETO', 'Novo retrato artístico gerado!', { portrait: compP, original_1: compO1, original_2: compO2 });
      } else {
        alert("A IA recebeu o pedido mas não gerou imagem. Tenta daqui a pouco!");
      }
    } catch (err) {
      console.error(err);
      alert(`Erro ao gerar retrato (Código ${err.message}).`);
    } finally { setIsGeneratingPortrait(false); }
  };

  const handleCheckInSubmit = async () => {
    setIsLoading(true);
    setMoodResponse('');
    try {
      const prompt = t.aiPrompt
        .replace('{mood}', answers.mood)
        .replace('{food}', answers.food)
        .replace('{water}', answers.water)
        .replace('{missing}', answers.missing)
        .replace('{battery}', answers.battery)
        .replace('{highlight}', answers.highlight);

      const data = await callGemini({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: t.aiSystem }] }
      }, 'generateContent', 'gemini-2.0-flash');

      const res = data.candidates?.[0]?.content?.parts?.[0]?.text || t.letterLove;
      setMoodResponse(res);
      logInteraction('CHECK-IN_COMPLETO', JSON.stringify(answers));
    } catch (err) {
      console.error(err);
      alert("Erro no Check-in.");
    } finally { setIsLoading(false); }
  };

  const playVoice = async (text) => {
    if (!text || isAudioLoading) return;
    setIsAudioLoading(true);
    try {
      const prompt = t.voicePrompt.replace('{text}', text);
      const data = await callGemini({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
        }
      }, 'generateContent', 'gemini-2.0-flash');
      const pcm = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (pcm && audioRef.current) {
        const byteCharacters = atob(pcm);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);
        view.setUint32(0, 0x46464952, true); view.setUint32(4, 36 + byteNumbers.length, true);
        view.setUint32(8, 0x45564157, true); view.setUint32(12, 0x20746d66, true);
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
        view.setUint32(24, 24000, true); view.setUint32(28, 48000, true);
        view.setUint16(32, 2, true); view.setUint16(34, 16, true);
        view.setUint32(36, 0x61746164, true); view.setUint32(40, byteNumbers.length, true);
        audioRef.current.src = URL.createObjectURL(new Blob([wavHeader, new Uint8Array(byteNumbers)], { type: 'audio/wav' }));
        audioRef.current.play();
      }
    } catch (err) { console.error(err); } finally { setIsAudioLoading(false); }
  };

  const isCheckInReady = answers.mood && answers.food && answers.water && answers.missing && answers.battery;

  return (
    <div className="min-h-screen bg-[#fff5f7] flex flex-col items-center p-4 md:p-10 relative overflow-hidden font-sans text-rose-900">
      <audio ref={audioRef} className="hidden" />
      {hearts.map(h => (
        <div key={h.id} className="absolute bottom-[-60px] text-rose-300/40 animate-float pointer-events-none select-none"
          style={{ left: `${h.left}%`, fontSize: `${h.size}px`, animationDuration: `${h.duration}s`, animationDelay: `${h.delay}s` }}>{h.id % 2 === 0 ? '❤️' : '✨'}</div>
      ))}

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button onClick={() => setLanguage('pt')} className={`text-2xl hover:scale-125 transition-transform ${language === 'pt' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>🇧🇷</button>
        <button onClick={() => setLanguage('th')} className={`text-2xl hover:scale-125 transition-transform ${language === 'th' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>🇹🇭</button>
      </div>

      <main className="z-10 w-full max-w-4xl space-y-8 pb-32 text-center">
        <section className="relative bg-white/50 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-white">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-1 rounded-full text-[10px] font-black shadow-lg animate-bounce uppercase tracking-widest"><Trophy size={12} className="inline mr-1" /> {t.trophy}</div>
          <div onClick={() => setShowAdmin(!showAdmin)} className="inline-block cursor-pointer transition-transform active:scale-90 hover:scale-110 mb-6 mt-4 relative">
            <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={42} />
            <div className="absolute -bottom-1 -right-1 bg-emerald-400 w-3 h-3 rounded-full border-2 border-white"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-8 bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent uppercase tracking-tighter">{t.title}</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: t.days, value: timeTogether.days }, { label: t.hours, value: timeTogether.hours }, { label: t.minutes, value: timeTogether.minutes }, { label: t.seconds, value: timeTogether.seconds }].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-3xl border border-rose-50 shadow-sm"><div className="text-3xl font-black text-rose-600 font-mono">{String(item.value).padStart(2, '0')}</div><div className="text-[10px] uppercase font-bold text-rose-300">{item.label}</div></div>
            ))}
          </div>
        </section>

        <section className="bg-white/90 p-8 rounded-[3rem] shadow-lg border-2 border-white space-y-10 text-left">
          <div className="flex items-center gap-3 mb-2 border-b border-rose-50 pb-4"><Sparkles className="text-pink-400" /><h2 className="text-2xl font-bold text-rose-800 tracking-tight uppercase">{t.checkinTitle}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4"><h3 className="text-rose-600 font-bold flex items-center gap-2 text-xs uppercase"><Smile size={16} /> {t.mood}</h3><div className="flex flex-wrap gap-2">{t.moods.map(l => (<button key={l} onClick={() => setAnswers({ ...answers, mood: l })} className={`px-3 py-1.5 rounded-full border-2 text-[10px] font-black uppercase transition-all ${answers.mood === l ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-rose-50 text-rose-300 hover:border-rose-200'}`}>{l}</button>))}</div></div>
            <div className="space-y-4"><h3 className="text-rose-600 font-bold flex items-center gap-2 text-xs uppercase"><BatteryMedium size={16} /> {t.battery}</h3><div className="flex flex-wrap gap-2">{t.batteries.map(l => (<button key={l} onClick={() => setAnswers({ ...answers, battery: l })} className={`px-3 py-1.5 rounded-full border-2 text-[10px] font-black uppercase transition-all ${answers.battery === l ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-rose-50 text-rose-300 hover:border-rose-200'}`}>{l}</button>))}</div></div>
            <div className="space-y-4"><h3 className="text-rose-600 font-bold flex items-center gap-2 text-xs uppercase"><Utensils size={16} /> {t.food}</h3><div className="flex flex-wrap gap-2">{t.foods.map(l => (<button key={l} onClick={() => setAnswers({ ...answers, food: l })} className={`px-3 py-1.5 rounded-full border-2 text-[10px] font-black uppercase transition-all ${answers.food === l ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-rose-50 text-rose-300 hover:border-rose-200'}`}>{l}</button>))}</div></div>
            <div className="space-y-4"><h3 className="text-rose-600 font-bold flex items-center gap-2 text-xs uppercase"><Droplets size={16} /> {t.water}</h3><div className="flex flex-wrap gap-2">{t.waters.map(l => (<button key={l} onClick={() => setAnswers({ ...answers, water: l })} className={`px-3 py-1.5 rounded-full border-2 text-[10px] font-black uppercase transition-all ${answers.water === l ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-rose-50 text-rose-300 hover:border-rose-200'}`}>{l}</button>))}</div></div>
          </div>
          <div className="space-y-4 pt-4 border-t border-rose-50"><h3 className="text-rose-600 font-bold flex items-center gap-2 text-xs uppercase"><Heart size={16} /> {t.missing}</h3><div className="grid grid-cols-3 md:grid-cols-5 gap-2">{t.missings.map(l => (<button key={l} onClick={() => setAnswers({ ...answers, missing: l })} className={`py-2 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${answers.missing === l ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-rose-50 text-rose-300'}`}>{l}</button>))}</div></div>
          <div className="space-y-4"><h3 className="text-rose-600 font-bold flex items-center gap-2 text-xs uppercase"><Stars size={16} /> {t.highlight}</h3><input type="text" value={answers.highlight} onChange={(e) => setAnswers({ ...answers, highlight: e.target.value })} placeholder={t.highlightPlaceholder} className="w-full bg-rose-50 border-2 border-rose-100 rounded-2xl py-3 px-6 focus:outline-none focus:border-rose-300 transition-all text-sm text-rose-900" /></div>
          <button onClick={handleCheckInSubmit} disabled={!isCheckInReady || isLoading} className="w-full py-4 bg-rose-500 text-white rounded-3xl font-black shadow-xl disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest text-xs">{isLoading ? <RefreshCw className="animate-spin inline mr-2" /> : t.submit}</button>
          {moodResponse && (<div className="p-8 bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] border-2 border-rose-100 animate-in zoom-in shadow-inner text-center italic">"{moodResponse}"<button onClick={() => playVoice(moodResponse)} className="block mx-auto mt-4 text-rose-500 font-bold text-[10px] uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm"><Volume2 size={14} className="inline mr-1" /> {t.listen}</button></div>)}
        </section>

        <div className="flex justify-center"><button onClick={() => setIsLetterOpen(!isLetterOpen)} className="px-12 py-5 bg-rose-600 text-white rounded-full font-black text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-tighter">{isLetterOpen ? <MailOpen /> : <Mail />} {isLetterOpen ? t.closeLetter : t.openLetter}</button></div>
        {isLetterOpen && (
          <div className="bg-white p-10 rounded-[3rem] border-2 border-rose-100 shadow-2xl animate-in zoom-in text-center space-y-8">
            <div className="italic font-serif text-rose-900 leading-relaxed text-lg"><p>{t.letterText}</p><p className="pt-4 font-black text-3xl not-italic text-rose-500 uppercase tracking-tighter">{t.letterLove}</p></div>
            <div className="pt-10 border-t border-rose-100 space-y-6">
              <div className="flex items-center justify-center gap-2 text-rose-600 font-bold uppercase text-xs tracking-widest"><Stars className="text-amber-400" size={16} /><span>{t.portraitTitle}</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-rose-200 rounded-3xl cursor-pointer hover:bg-rose-50 transition-all">{photo1 ? <span className="text-[10px] text-rose-400 font-black uppercase">OK ✓</span> : <Upload size={20} className="mb-2 text-rose-300" />}<input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto1(e.target.files[0])} /></label>
                <label className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-rose-200 rounded-3xl cursor-pointer hover:bg-rose-50 transition-all">{photo2 ? <span className="text-[10px] text-rose-400 font-black uppercase">OK ✓</span> : <Upload size={20} className="mb-2 text-rose-300" />}<input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto2(e.target.files[0])} /></label>
              </div>
              <button onClick={generatePortrait} disabled={!photo1 || !photo2 || isGeneratingPortrait} className="w-full py-4 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 transition-all uppercase text-[10px] tracking-[0.2em]">{isGeneratingPortrait ? <RefreshCw className="animate-spin" /> : t.generatePortrait}</button>
              {generatedPortrait && (<div className="mt-8 p-4 bg-rose-50 rounded-[2.5rem] shadow-inner animate-in fade-in border border-rose-100"><img src={generatedPortrait} alt="Eterno" className="rounded-[2rem] shadow-2xl mx-auto max-w-full border-4 border-white" /><button onClick={() => downloadImage(generatedPortrait)} className="mt-4 px-6 py-2 bg-white text-rose-500 font-bold rounded-full shadow-md text-xs uppercase tracking-widest hover:bg-rose-50 flex items-center gap-2 mx-auto"><Upload className="rotate-180" size={14} /> {t.download}</button></div>)}
            </div>
          </div>
        )}

        {showAdmin && (
          <div className="fixed inset-0 z-[100] bg-rose-950/95 backdrop-blur-md p-6 overflow-y-auto flex items-center justify-center text-left">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 shadow-2xl relative border-4 border-rose-100">
              <button onClick={() => setShowAdmin(false)} className="absolute top-6 right-6 text-rose-300 hover:text-rose-600"><X size={24} /></button>
              <div className="flex items-center gap-3 mb-6 border-b pb-4"><History className="text-rose-500" size={20} /><h3 className="font-black text-rose-800 text-xl tracking-tight uppercase">{t.archiveTitle}</h3></div>
              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {interactions.map(item => (
                  <div key={item.id} className="p-5 bg-rose-50 rounded-2xl border border-rose-100 relative group animate-in slide-in-from-right-2">
                    <div className="text-[9px] font-black text-rose-400 mb-2 flex justify-between uppercase tracking-[0.2em]"><span>{item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'Recente'}</span><span className="text-rose-600 flex items-center gap-1"><Cloud size={10} /> {item.type}</span></div>
                    <div className="text-rose-900 leading-relaxed font-medium text-xs mb-3">{item.type === 'CHECK-IN_COMPLETO' ? (<pre className="whitespace-pre-wrap font-sans bg-white/60 p-3 rounded-xl border border-rose-50 mt-1">{JSON.stringify(JSON.parse(item.content), null, 2)}</pre>) : item.content}</div>
                    {item.type === 'RETRATO_IA_COMPLETO' && (<div className="space-y-4 bg-white p-3 rounded-2xl border border-rose-50 shadow-inner"><div className="grid grid-cols-2 gap-2"><img src={`data:image/png;base64,${item.original_1}`} className="rounded-lg w-full h-auto border-2 border-rose-50" /><img src={`data:image/png;base64,${item.original_2}`} className="rounded-lg w-full h-auto border-2 border-rose-50" /></div><div className="pt-2 border-t border-rose-50 text-center"><span className="text-[8px] font-black text-rose-500 uppercase block mb-1">Pintura IA Arquivada ✨</span><img src={`data:image/png;base64,${item.portrait}`} className="w-full h-auto rounded-xl shadow-md border-2 border-white mx-auto" /></div></div>)}
                    <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'interactions', item.id))} className="absolute -top-2 -right-2 bg-white text-rose-200 hover:text-red-500 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <footer className="text-center text-rose-200 text-[10px] tracking-[0.4em] font-bold uppercase pb-10 flex items-center justify-center gap-2">Cloud Sync Ativo <Cloud size={12} /> • 2025-2026</footer>
      </main>
      <style>{`
        @keyframes float { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; } 10% { opacity: 0.4; } 100% { transform: translateY(-120vh) rotate(360deg) scale(1.5); opacity: 0; } }
        .animate-float { animation: float linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fecdd3; border-radius: 10px; }
      `}</style>
    </div>
  );
}
