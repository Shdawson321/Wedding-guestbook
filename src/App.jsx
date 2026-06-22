import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RotateCcw, Check, Play, ChevronLeft, Heart, Settings, Loader } from "lucide-react";

// ─── Supabase config ──────────────────────────────────────────────────────────
const SB_URL  = "https://yzlaukdlfchojogxxrky.supabase.co";
const SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bGF1a2RsZmNob2pvZ3h4cmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwODI3NTcsImV4cCI6MjA5NzY1ODc1N30.GL2kAEB416MR3AlTkbQmG-0QPRke6Xpd9qDCo53R3P4";
const EVENT_ID = "darnell-sheniza-2026";
const BUCKET   = "videos";

const sbHeaders = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
};

async function uploadVideo(blob) {
  const filename = `${EVENT_ID}/${Date.now()}.webm`;
  const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "video/webm" },
    body: blob,
  });
  if (!res.ok) throw new Error("Upload failed");
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

async function saveMessage({ prompt, video_url, guest_name }) {
  const res = await fetch(`${SB_URL}/rest/v1/messages`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "return=representation" },
    body: JSON.stringify({ event_id: EVENT_ID, prompt, video_url, guest_name }),
  });
  if (!res.ok) throw new Error("Save failed");
  return res.json();
}

async function fetchMessages() {
  const res = await fetch(
    `${SB_URL}/rest/v1/messages?event_id=eq.${EVENT_ID}&order=created_at.desc&select=*`,
    { headers: sbHeaders }
  );
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  cream: "#F7F2E7", creamDeep: "#EEE4CF", olive: "#454F3E", oliveSoft: "#7C8568",
  gold: "#B7944C", goldLight: "#DCC58F", ink: "#2B2A24", rose: "#A8584A", bezel: "#211F1B",
};

const PROMPTS = [
  "Tell them how you first met",
  "Share your best wish for their marriage",
  "Give them advice for year one",
  "Just say hello and send your love",
];

const MAX_SECONDS = 45;
const COUPLE = "Darnell & Sheniza";

// ─── Styles ───────────────────────────────────────────────────────────────────
const btnPrimary = {
  background: C.gold, color: "#fff", border: "none", borderRadius: 99,
  padding: "11px 22px", fontSize: 12.5, letterSpacing: 0.5, cursor: "pointer",
  fontFamily: "Jost, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
};
const btnGhost = {
  background: "transparent", color: C.ink, border: `1px solid ${C.oliveSoft}`, borderRadius: 99,
  padding: "11px 22px", fontSize: 12.5, letterSpacing: 0.5, cursor: "pointer",
  fontFamily: "Jost, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
};

function Fonts() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@300;400;500;600&display=swap');
    .d{font-family:'Cormorant Garamond',serif}
    .b{font-family:'Jost',sans-serif}
    .fade{animation:fd .5s ease both}
    @keyframes fd{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .pulse{animation:pl 1.4s ease-in-out infinite}
    @keyframes pl{0%,100%{opacity:1}50%{opacity:.35}}
    @media(prefers-reduced-motion:reduce){.fade,.pulse{animation:none!important}}
  `}</style>;
}

function Corner({ r = 0 }) {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"
      style={{ position: "absolute", transform: `rotate(${r}deg)`, opacity: 0.55 }}>
      <path d="M2 2 C 2 20, 2 30, 22 30" stroke={C.gold} strokeWidth="1" />
      <path d="M2 2 C 20 2, 30 2, 30 22" stroke={C.gold} strokeWidth="1" />
      <circle cx="2" cy="2" r="2" fill={C.gold} />
    </svg>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────
function WelcomeScreen({ onBegin, count }) {
  return (
    <div className="fade" style={{
      height: "100%", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24, position: "relative", textAlign: "center",
    }}>
      <div style={{ position: "absolute", top: 14, left: 14 }}><Corner r={0} /></div>
      <div style={{ position: "absolute", top: 14, right: 14 }}><Corner r={90} /></div>
      <div style={{ position: "absolute", bottom: 14, right: 14 }}><Corner r={180} /></div>
      <div style={{ position: "absolute", bottom: 14, left: 14 }}><Corner r={270} /></div>
      <Heart size={16} color={C.gold} style={{ marginBottom: 10 }} />
      <div className="d" style={{ fontSize: 30, color: C.ink, lineHeight: 1.15 }}>{COUPLE}</div>
      <div className="b" style={{ fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: C.oliveSoft, marginTop: 6 }}>
        are getting married
      </div>
      <div className="d" style={{ fontSize: 16, color: C.ink, marginTop: 22, fontStyle: "italic" }}>
        Leave them a video message
      </div>
      <button onClick={onBegin} style={{
        marginTop: 30, width: 86, height: 86, borderRadius: 99, background: C.gold, border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 20px rgba(183,148,76,0.4)", cursor: "pointer",
      }}>
        <Camera size={28} color="#fff" />
      </button>
      <div className="b" style={{ fontSize: 11, letterSpacing: 1, color: C.oliveSoft, marginTop: 10, textTransform: "uppercase" }}>
        Tap to begin
      </div>
      {count > 0 && (
        <div className="b" style={{ fontSize: 11.5, color: C.oliveSoft, marginTop: 18 }}>
          {count} message{count === 1 ? "" : "s"} so far today
        </div>
      )}
    </div>
  );
}

function PromptScreen({ onPick, onSkip, onBack }) {
  return (
    <div className="fade" style={{ height: "100%", display: "flex", flexDirection: "column", padding: "20px 18px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", alignSelf: "flex-start", opacity: 0.6, cursor: "pointer", marginBottom: 8 }}>
        <ChevronLeft size={18} color={C.ink} />
      </button>
      <div className="d" style={{ fontSize: 20, color: C.ink, marginBottom: 4 }}>Choose a moment</div>
      <div className="b" style={{ fontSize: 12, color: C.oliveSoft, marginBottom: 18 }}>Or skip straight to recording</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {PROMPTS.map((p) => (
          <button key={p} onClick={() => onPick(p)} style={{
            textAlign: "left", padding: "13px 14px", borderRadius: 12,
            border: `1px solid ${C.goldLight}`, background: "#fff",
            fontSize: 13, color: C.ink, cursor: "pointer", fontFamily: "Jost, sans-serif",
          }}>{p}</button>
        ))}
      </div>
      <button onClick={onSkip} style={{ ...btnGhost, marginTop: 10 }}>Skip — just record</button>
    </div>
  );
}

function CameraScreen({ phase, countdown, elapsed, ringPct, cameraAvailable, videoRef, prompt, onReady, onStop }) {
  return (
    <div style={{ height: "100%", position: "relative", background: C.bezel }}>
      {cameraAvailable === true ? (
        <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
      ) : cameraAvailable === false ? (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.creamDeep, textAlign: "center", padding: 22, gap: 8 }}>
          <Camera size={28} className={phase === "recording" ? "pulse" : ""} />
          <div className="b" style={{ fontSize: 12.5, opacity: 0.85 }}>Camera unavailable in this sandbox — on the real iPad this is a live view.</div>
        </div>
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="b pulse" style={{ color: C.creamDeep, fontSize: 12 }}>Requesting camera…</div>
        </div>
      )}
      {prompt && phase !== "recording" && (
        <div className="b" style={{
          position: "absolute", top: 14, left: 14, right: 14,
          background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 12,
          padding: "8px 12px", borderRadius: 10,
        }}>{prompt}</div>
      )}
      {phase === "preview" && (
        <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <button onClick={onReady} style={btnPrimary}>I'm ready</button>
        </div>
      )}
      {phase === "countdown" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)" }}>
          <div className="d" style={{ fontSize: 64, color: "#fff" }}>{countdown}</div>
        </div>
      )}
      {phase === "recording" && (
        <>
          <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.5)", padding: "5px 10px", borderRadius: 99 }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: 99, background: C.rose }} />
            <span className="b" style={{ color: "#fff", fontSize: 11 }}>
              {String(Math.floor(elapsed / 60)).padStart(1, "0")}:{String(elapsed % 60).padStart(2, "0")}
            </span>
          </div>
          <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <button onClick={onStop} style={{
              width: 60, height: 60, borderRadius: 99, border: "3px solid #fff",
              background: `conic-gradient(${C.gold} ${ringPct * 3.6}deg, rgba(255,255,255,0.25) 0deg)`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: "#fff" }} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ReviewScreen({ url, cameraAvailable, onRetake, onSubmit, uploading }) {
  return (
    <div className="fade" style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bezel }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? (
          <video src={url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="b" style={{ color: C.creamDeep, textAlign: "center", padding: 24, fontSize: 12.5 }}>
            <Play size={24} style={{ marginBottom: 8 }} />
            <div>Camera unavailable in sandbox — your message would upload here on the real device.</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, padding: 16, background: C.cream }}>
        <button onClick={onRetake} disabled={uploading} style={{ ...btnGhost, flex: 1 }}>
          <RotateCcw size={14} /> Retake
        </button>
        <button onClick={onSubmit} disabled={uploading} style={{ ...btnPrimary, flex: 1, opacity: uploading ? 0.7 : 1 }}>
          {uploading ? <><Loader size={14} className="pulse" /> Saving…</> : <><Check size={14} /> Submit</>}
        </button>
      </div>
    </div>
  );
}

function ThankYouScreen() {
  return (
    <div className="fade" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: 99, background: C.olive, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Check size={24} color={C.gold} />
      </div>
      <div className="d" style={{ fontSize: 22, color: C.ink }}>Thank you</div>
      <div className="b" style={{ fontSize: 12.5, color: C.oliveSoft, marginTop: 6, maxWidth: 200 }}>
        Your message means the world to Darnell and Sheniza.
      </div>
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ messages, loading }) {
  return (
    <div style={{ width: 420, maxWidth: "92vw", background: C.cream, borderRadius: 18, padding: "22px 22px 26px", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <div className="d" style={{ fontSize: 19, color: C.ink }}>{COUPLE}'s Gallery</div>
        <div className="b" style={{ fontSize: 11, color: C.oliveSoft, letterSpacing: 1 }}>
          {loading ? "loading…" : `${messages.length} message${messages.length === 1 ? "" : "s"}`}
        </div>
      </div>
      <div className="b" style={{ fontSize: 12.5, color: C.oliveSoft, marginBottom: 16 }}>
        Saved to Supabase — every clip ready to watch or download.
      </div>
      {loading ? (
        <div className="b pulse" style={{ textAlign: "center", color: C.oliveSoft, padding: 30, fontSize: 13 }}>Loading messages…</div>
      ) : messages.length === 0 ? (
        <div className="b" style={{ border: `1px dashed ${C.goldLight}`, borderRadius: 12, padding: "26px 16px", textAlign: "center", color: C.oliveSoft, fontSize: 13 }}>
          No messages yet — record one on the kiosk above.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ background: C.creamDeep, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.goldLight}` }}>
              <div style={{ aspectRatio: "9/12", background: C.olive, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {m.video_url ? (
                  <video src={m.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                ) : (
                  <Camera size={22} color={C.creamDeep} style={{ opacity: 0.7 }} />
                )}
                {m.video_url && (
                  <a href={m.video_url} target="_blank" rel="noreferrer" style={{
                    position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.55)",
                    borderRadius: 99, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Play size={12} color="#fff" />
                  </a>
                )}
              </div>
              <div className="b" style={{ padding: "8px 10px", fontSize: 11, color: C.ink, lineHeight: 1.3 }}>
                {m.prompt || "Free message"}
                <div style={{ fontSize: 10, color: C.oliveSoft, marginTop: 2 }}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState("welcome");
  const [phase, setPhase]             = useState("preview");
  const [countdown, setCountdown]     = useState(3);
  const [elapsed, setElapsed]         = useState(0);
  const [selectedPrompt, setPrompt]   = useState(null);
  const [cameraAvailable, setCamera]  = useState(null);
  const [recordedBlob, setBlob]       = useState(null);
  const [recordedUrl, setUrl]         = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [messages, setMessages]       = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);

  const videoRef      = useRef(null);
  const streamRef     = useRef(null);
  const recorderRef   = useRef(null);
  const chunksRef     = useRef([]);
  const timerRef      = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = () => { clearInterval(timerRef.current); timerRef.current = null; };

  useEffect(() => { loadMessages(); }, []);
  useEffect(() => () => { stopStream(); clearTimer(); }, [stopStream]);

  async function loadMessages() {
    setLoadingMsgs(true);
    try { setMessages(await fetchMessages()); } catch (e) { console.error(e); }
    setLoadingMsgs(false);
  }

  async function goCameraScreen() {
    setScreen("camera"); setPhase("preview"); setElapsed(0); setCamera(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      setCamera(true);
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
    } catch { setCamera(false); }
  }

  function beginCountdown() { setCountdown(3); setPhase("countdown"); }

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { startRecording(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 750);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  function startRecording() {
    setPhase("recording"); setElapsed(0);
    if (cameraAvailable && streamRef.current) {
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setBlob(blob);
        setUrl(URL.createObjectURL(blob));
        stopStream();
        setScreen("review");
      };
      recorderRef.current = rec;
      rec.start();
    }
    timerRef.current = setInterval(() => {
      setElapsed((prev) => { if (prev + 1 >= MAX_SECONDS) { finishRecording(); } return prev + 1; });
    }, 1000);
  }

  function finishRecording() {
    clearTimer();
    if (cameraAvailable && recorderRef.current?.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      stopStream(); setBlob(null); setUrl(null); setScreen("review");
    }
  }

  function retake() { setBlob(null); setUrl(null); goCameraScreen(); }

  async function submit() {
    setUploading(true);
    try {
      let video_url = null;
      if (recordedBlob) video_url = await uploadVideo(recordedBlob);
      await saveMessage({ prompt: selectedPrompt, video_url, guest_name: null });
      await loadMessages();
    } catch (e) { console.error("Submit error:", e); }
    setUploading(false);
    setScreen("thankyou");
  }

  useEffect(() => {
    if (screen !== "thankyou") return;
    const t = setTimeout(() => { setPrompt(null); setBlob(null); setUrl(null); setScreen("welcome"); }, 4000);
    return () => clearTimeout(t);
  }, [screen]);

  const ringPct = Math.min(100, (elapsed / MAX_SECONDS) * 100);

  return (
    <div className="b" style={{ minHeight: "100vh", width: "100%", background: `linear-gradient(180deg, ${C.olive}, #2F362A)`, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px", gap: 28 }}>
      <Fonts />
      <div style={{ textAlign: "center", color: C.creamDeep }}>
        <div className="d" style={{ fontSize: 22, letterSpacing: 0.5 }}>The Video Guestbook</div>
        <div className="b" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, marginTop: 2 }}>
          live — connected to supabase
        </div>
      </div>

      {/* iPad bezel */}
      <div style={{ width: 320, maxWidth: "92vw", aspectRatio: "9 / 17.5", background: C.bezel, borderRadius: 36, padding: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.45)", position: "relative" }}>
        <div style={{ position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: 99, background: "#444" }} />
        <div style={{ width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", background: C.cream, position: "relative" }}>
          {screen === "welcome" && <WelcomeScreen onBegin={() => setScreen("prompt")} count={messages.length} />}
          {screen === "prompt"  && <PromptScreen onPick={(p) => { setPrompt(p); goCameraScreen(); }} onSkip={() => { setPrompt(null); goCameraScreen(); }} onBack={() => setScreen("welcome")} />}
          {screen === "camera"  && <CameraScreen phase={phase} countdown={countdown} elapsed={elapsed} ringPct={ringPct} cameraAvailable={cameraAvailable} videoRef={videoRef} prompt={selectedPrompt} onReady={beginCountdown} onStop={finishRecording} />}
          {screen === "review"  && <ReviewScreen url={recordedUrl} cameraAvailable={cameraAvailable} onRetake={retake} onSubmit={submit} uploading={uploading} />}
          {screen === "thankyou" && <ThankYouScreen />}
        </div>
      </div>

      <Gallery messages={messages} loading={loadingMsgs} />
    </div>
  );
}
