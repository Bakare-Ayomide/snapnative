import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import Editor from "@monaco-editor/react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { generateCode } from "@/server/generate.functions";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Studio · snapnative" },
      { name: "description", content: "Prompt → React Native or web app, live in your browser." },
    ],
  }),
  component: Playground,
});

type Msg = { role: "user" | "model"; text: string };
type Target = "native" | "web";

const DEFAULT_NATIVE = `import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello from snapnative ✨</Text>
      <Text style={styles.subtitle}>Describe your app on the left to generate something cool.</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#c8ff4d', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#9aa0b4', marginTop: 12, textAlign: 'center' },
});
`;

const DEFAULT_WEB = `export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
      <h1 className="text-4xl font-bold text-lime-300">Hello from snapnative ✨</h1>
      <p className="mt-3 text-slate-400">Describe your app on the left to start.</p>
    </div>
  );
}
`;

function Playground() {
  const generate = useServerFn(generateCode);
  const [target, setTarget] = useState<Target>("native");
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState(DEFAULT_NATIVE);
  const [history, setHistory] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [userKey, setUserKey] = useState("");
  const [previewMode, setPreviewMode] = useState<"web" | "snack">("snack");

  useEffect(() => {
    setUserKey(localStorage.getItem("gemini_key") ?? "");
  }, []);

  useEffect(() => {
    setPreviewMode(target === "native" ? "snack" : "web");
  }, [target]);

  async function onSend() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setErr(null);
    const userMsg: Msg = { role: "user", text: prompt };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setPrompt("");
    try {
      const res = await generate({
        data: {
          prompt: userMsg.text,
          target,
          history: history.slice(-8),
          userApiKey: userKey || undefined,
        },
      });
      if (!res.ok) {
        setErr(res.error);
        setHistory((h) => [...h, { role: "model", text: `❌ ${res.error}` }]);
      } else {
        setCode(res.code);
        setHistory((h) => [...h, { role: "model", text: "✅ Updated code in editor →" }]);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function changeTarget(t: Target) {
    setTarget(t);
    setCode(t === "native" ? DEFAULT_NATIVE : DEFAULT_WEB);
    setHistory([]);
  }

  function saveKey() {
    localStorage.setItem("gemini_key", userKey);
    setShowSettings(false);
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/40 px-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">◆</span>
            snap<span className="text-gradient">native</span>
          </Link>
          <div className="ml-2 flex items-center rounded-full border border-border bg-background p-0.5 text-xs font-medium">
            {(["native", "web"] as Target[]).map((t) => (
              <button
                key={t}
                onClick={() => changeTarget(t)}
                className={`rounded-full px-3 py-1.5 capitalize transition ${
                  target === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "native" ? "📱 Native" : "🌐 Web"}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          ⚙ API key {userKey ? "· custom" : ""}
        </button>
      </div>

      {/* 3 panes */}
      <div className="grid flex-1 min-h-0 grid-cols-1 gap-px bg-border md:grid-cols-[320px_1fr_1fr]">
        {/* Chat */}
        <div className="flex min-h-0 flex-col bg-background">
          <div className="border-b border-border px-4 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Prompt
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Try: <em>"a habit tracker with streaks and a circular progress ring"</em>
              </div>
            )}
            {history.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-3 text-sm ${
                  m.role === "user"
                    ? "ml-6 bg-primary/10 border border-primary/30 text-foreground"
                    : "mr-6 bg-card border border-border text-muted-foreground"
                }`}
              >
                {m.text}
              </motion.div>
            ))}
            {busy && (
              <div className="mr-6 flex gap-1 rounded-xl border border-border bg-card p-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--neon-magenta)] [animation-delay:240ms]" />
              </div>
            )}
          </div>
          <div className="border-t border-border p-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
              }}
              rows={3}
              placeholder="Describe your app…"
              className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={onSend}
              disabled={busy || !prompt.trim()}
              className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition disabled:opacity-50 hover:enabled:scale-[1.01] glow-lime"
            >
              {busy ? "Generating…" : "Generate ✨ (⌘↵)"}
            </button>
            {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
          </div>
        </div>

        {/* Editor */}
        <div className="flex min-h-0 flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {target === "native" ? "App.tsx (Expo)" : "App.tsx (React)"}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Copy
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              theme="vs-dark"
              language="typescript"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex min-h-0 flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Preview</span>
            <div className="flex rounded-full border border-border p-0.5 text-xs">
              {target === "native" && (
                <button
                  onClick={() => setPreviewMode("snack")}
                  className={`rounded-full px-2 py-1 ${previewMode === "snack" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Snack
                </button>
              )}
              <button
                onClick={() => setPreviewMode("web")}
                className={`rounded-full px-2 py-1 ${previewMode === "web" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Web
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-[#0a0a14]">
            {previewMode === "snack" && target === "native" ? (
              <SnackPreview code={code} />
            ) : (
              <WebPreview code={code} target={target} />
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            >
              <h3 className="font-display text-xl font-bold">Gemini API key</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Bring your own key (overrides the server default). Stored only in your browser.
                Get one free at{" "}
                <a className="text-primary underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                  aistudio.google.com
                </a>.
              </p>
              <input
                value={userKey}
                onChange={(e) => setUserKey(e.target.value)}
                placeholder="AIza…"
                className="mt-4 w-full rounded-xl border border-border bg-background p-3 font-mono text-sm outline-none focus:border-primary"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    localStorage.removeItem("gemini_key");
                    setUserKey("");
                  }}
                  className="flex-1 rounded-xl border border-border bg-background py-2 text-sm font-medium hover:bg-muted"
                >
                  Clear
                </button>
                <button
                  onClick={saveKey}
                  className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground glow-lime"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- Expo Snack embedded preview --- */
function SnackPreview({ code }: { code: string }) {
  // Snack embedded supports POST via form to set code. We use a key to remount on changes (debounced).
  const [snackKey, setSnackKey] = useState(0);
  const [debounced, setDebounced] = useState(code);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(code);
      setSnackKey((k) => k + 1);
    }, 800);
    return () => clearTimeout(t);
  }, [code]);

  const url = `https://snack.expo.dev/embedded?platform=web&preview=true&theme=dark&waitForData=true&name=snapnative&code=${encodeURIComponent(debounced)}`;

  // Snack URL has a length limit — fall back if too long
  if (url.length > 7500) {
    return (
      <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
        Code is too long to embed in Snack directly.
        <br />
        <a
          className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-primary-foreground"
          href={`https://snack.expo.dev/?code=${encodeURIComponent(debounced)}&name=snapnative&platform=ios`}
          target="_blank"
          rel="noreferrer"
        >
          Open in Expo Snack →
        </a>
      </div>
    );
  }

  return (
    <iframe
      key={snackKey}
      src={url}
      className="h-full w-full border-0"
      title="Expo Snack preview"
      allow="geolocation; camera; microphone"
    />
  );
}

/* --- Live web preview using Babel + CDN React --- */
function WebPreview({ code, target }: { code: string; target: Target }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSrc(buildPreviewHtml(code, target)), 400);
    return () => clearTimeout(t);
  }, [code, target]);
  return <iframe srcDoc={src} className="h-full w-full border-0 bg-white" title="Web preview" sandbox="allow-scripts" />;
}

function buildPreviewHtml(code: string, target: Target) {
  const shimNative = target === "native"
    ? `
      // Tiny react-native → web shim so Expo code runs in iframe
      const RN = (() => {
        const make = (tag, defaults={}) => React.forwardRef((props, ref) => {
          const { style, children, ...rest } = props;
          const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style||{});
          return React.createElement(tag, { ref, style: { display:'flex', flexDirection:'column', ...defaults, ...flat }, ...rest }, children);
        });
        return {
          View: make('div'),
          SafeAreaView: make('div', { minHeight: '100%' }),
          ScrollView: make('div', { overflow: 'auto' }),
          Text: make('span', { display: 'inline' }),
          Image: React.forwardRef((p, ref) => React.createElement('img', { ref, src: (p.source && p.source.uri) || p.src, style: p.style })),
          TextInput: React.forwardRef((p, ref) => React.createElement('input', { ref, value: p.value, placeholder: p.placeholder, onChange: e => p.onChangeText && p.onChangeText(e.target.value), style: { padding: 8, ...(p.style||{}) } })),
          TouchableOpacity: React.forwardRef((p, ref) => React.createElement('button', { ref, onClick: p.onPress, style: { background:'transparent', border:0, cursor:'pointer', textAlign:'left', padding:0, ...(p.style||{}) } }, p.children)),
          Pressable: React.forwardRef((p, ref) => React.createElement('button', { ref, onClick: p.onPress, style: { background:'transparent', border:0, cursor:'pointer', padding:0, ...(p.style||{}) } }, typeof p.children==='function' ? p.children({pressed:false}) : p.children)),
          Button: ({ title, onPress, color }) => React.createElement('button', { onClick: onPress, style: { background: color||'#2563eb', color:'#fff', padding:'8px 16px', border:0, borderRadius:6, cursor:'pointer' } }, title),
          FlatList: ({ data=[], renderItem, keyExtractor }) => React.createElement('div', null, data.map((item,index)=> React.createElement('div', { key: keyExtractor? keyExtractor(item,index): index }, renderItem({item,index})))),
          StyleSheet: { create: s => s, flatten: s => Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s, hairlineWidth: 1, absoluteFill: { position:'absolute', top:0,left:0,right:0,bottom:0 }, absoluteFillObject: { position:'absolute', top:0,left:0,right:0,bottom:0 } },
          Platform: { OS: 'web', select: o => o.web || o.default },
          Dimensions: { get: () => ({ width: window.innerWidth, height: window.innerHeight }) },
          Alert: { alert: (t,m) => alert((t||'') + (m? '\\n'+m:'')) },
          Linking: { openURL: (u) => window.open(u,'_blank') },
          Animated: { View: make('div'), Text: make('span'), Value: function(v){this._v=v;this.setValue=x=>this._v=x;}, timing: () => ({ start: cb => cb && cb() }), spring: () => ({ start: cb => cb && cb() }), parallel: () => ({ start: cb => cb && cb() }) },
          ActivityIndicator: () => React.createElement('div', { style:{ width:24, height:24, border:'3px solid #888', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}),
          KeyboardAvoidingView: make('div'),
          StatusBar: () => null,
          useColorScheme: () => 'dark',
          useWindowDimensions: () => ({ width: window.innerWidth, height: window.innerHeight, scale: 1, fontScale: 1 }),
        };
      })();
      window.__RN__ = RN;
      window.__shims__ = {
        'react-native': RN,
        'expo-status-bar': { StatusBar: () => null },
        'expo-linear-gradient': { LinearGradient: ({ colors=[], style, children }) => React.createElement('div', { style: { background: 'linear-gradient(135deg,'+colors.join(',')+')', ...(style||{}) } }, children) },
        '@expo/vector-icons': new Proxy({}, { get: () => (props) => React.createElement('span', { style: { fontSize: props.size||16, color: props.color } }, '◆') }),
      };
    `
    : `window.__shims__ = {};`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body,#root{height:100%;margin:0;background:#0a0a14;color:#fff;font-family:system-ui,sans-serif}@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}</style>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head><body><div id="root"></div>
<script>${shimNative}
window.require = (name) => { if (window.__shims__[name]) return window.__shims__[name]; if (name==='react') return React; if (name==='react-dom') return ReactDOM; throw new Error('Module not available in preview: '+name); };
</script>
<script type="text/babel" data-presets="env,react,typescript">
const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Fragment, memo, forwardRef } = React;
try {
  ${stripImports(code)}
  const __App = (typeof App !== 'undefined') ? App : (typeof Main !== 'undefined' ? Main : null);
  if (!__App) throw new Error('No default App component found');
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(__App));
} catch (e) {
  document.getElementById('root').innerHTML = '<div style="padding:24px;font-family:monospace;color:#ff6b9d;white-space:pre-wrap">Preview error: '+(e && e.message ? e.message : e)+'</div>';
}
</script></body></html>`;
}

function stripImports(code: string): string {
  // Convert ES imports → const X = require('mod') so Babel-in-browser can run it.
  return code
    .replace(/^\s*import\s+([^'";]+?)\s+from\s+['"]([^'"]+)['"]\s*;?/gm, (_m, what: string, mod: string) => {
      const parts = what.trim();
      // default + named: `Default, { a, b as c }`
      const defaultMatch = parts.match(/^([A-Za-z_$][\w$]*)\s*(?:,\s*\{([^}]+)\})?/);
      const namedOnlyMatch = parts.match(/^\{([^}]+)\}$/);
      const namespaceMatch = parts.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (namespaceMatch) return `const ${namespaceMatch[1]} = require('${mod}');`;
      if (namedOnlyMatch) return `const { ${namedOnlyMatch[1]} } = require('${mod}');`;
      if (defaultMatch) {
        const def = defaultMatch[1];
        const named = defaultMatch[2];
        return named
          ? `const __m_${def} = require('${mod}'); const ${def} = __m_${def}.default || __m_${def}; const { ${named} } = __m_${def};`
          : `const __m_${def} = require('${mod}'); const ${def} = __m_${def}.default || __m_${def};`;
      }
      return `require('${mod}');`;
    })
    .replace(/^\s*export\s+default\s+/gm, "var App = ")
    .replace(/^\s*export\s+/gm, "");
}
