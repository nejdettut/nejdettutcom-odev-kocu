"use client";

import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  HelpCircle,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Hint = { step: number; question: string; why: string };
type Result = {
  understanding: string;
  clarifyingQuestions: string[];
  hints: Hint[];
  concepts: string[];
  encouragement: string;
};

type Grade =
  | "ilkokul-1-2"
  | "ilkokul-3-4"
  | "ortaokul-5-6"
  | "ortaokul-7-8"
  | "lise";
type Subject =
  | "matematik"
  | "fen"
  | "turkce"
  | "sosyal"
  | "ingilizce"
  | "fizik"
  | "kimya"
  | "biyoloji"
  | "tarih"
  | "cografya"
  | "diger";

const GRADES: { v: Grade; l: string }[] = [
  { v: "ilkokul-1-2", l: "1-2" },
  { v: "ilkokul-3-4", l: "3-4" },
  { v: "ortaokul-5-6", l: "5-6" },
  { v: "ortaokul-7-8", l: "7-8" },
  { v: "lise", l: "Lise" },
];

const SUBJECTS: { v: Subject; l: string }[] = [
  { v: "matematik", l: "Matematik" },
  { v: "fen", l: "Fen" },
  { v: "turkce", l: "Türkçe" },
  { v: "sosyal", l: "Sosyal" },
  { v: "ingilizce", l: "İngilizce" },
  { v: "fizik", l: "Fizik" },
  { v: "kimya", l: "Kimya" },
  { v: "biyoloji", l: "Biyoloji" },
  { v: "tarih", l: "Tarih" },
  { v: "cografya", l: "Coğrafya" },
  { v: "diger", l: "Diğer" },
];

const EXAMPLES: Array<{
  label: string;
  question: string;
  grade: Grade;
  subject: Subject;
}> = [
  {
    label: "Matematik · ortaokul",
    grade: "ortaokul-5-6",
    subject: "matematik",
    question: "Bir sayının 3 katı ile 12'nin toplamı 30'a eşittir. Sayı kaçtır?",
  },
  {
    label: "Fen · lise",
    grade: "lise",
    subject: "fen",
    question:
      "Bir cismin kütlesi 2 kg, yüksekliği 10 m. Serbest düşme sırasında yere çarpma hızını nasıl bulurum?",
  },
  {
    label: "Türkçe · ortaokul",
    grade: "ortaokul-7-8",
    subject: "turkce",
    question:
      "Bir metindeki yan anlam ile mecaz anlam arasındaki farkı nasıl anlarım? Örnekle açıklayamıyorum.",
  },
];

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 disabled:opacity-50 dark:bg-brand-turquoise dark:text-brand-navy";
const CARD =
  "rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60";
const MUTED = "text-slate-500 dark:text-slate-400";

export function OdevApp() {
  const [question, setQuestion] = useState("");
  const [grade, setGrade] = useState<Grade>("ortaokul-5-6");
  const [subject, setSubject] = useState<Subject>("matematik");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    if (question.trim().length < 5) {
      setError("Soruyu en az 5 karakter yaz.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/koc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, grade, subject }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Bilinmeyen hata.");
      else setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ağ hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className={CARD}>
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <BookOpen className="size-4 text-brand-turquoise" />
              Ödev sorun ne?
            </h2>
          </div>
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED)}>
                  Sınıf
                </label>
                <div className="flex flex-wrap gap-1">
                  {GRADES.map((g) => (
                    <button
                      key={g.v}
                      type="button"
                      onClick={() => setGrade(g.v)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-[11px] font-medium",
                        grade === g.v
                          ? "border-brand-navy bg-brand-navy/5 dark:border-brand-turquoise dark:bg-brand-turquoise/10"
                          : "border-slate-300 bg-white/50 dark:border-slate-700 dark:bg-slate-900/40",
                      )}
                    >
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED)}>
                  Ders
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.v} value={s.v}>
                      {s.l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Örn: Bir sayının 3 katı ile 12'nin toplamı 30'a eşittir. Sayı kaçtır?"
              className="block h-36 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed shadow-inner outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={run}
                disabled={loading}
                className={BTN_PRIMARY}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Düşünülüyor…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Rehberlik al
                  </>
                )}
              </button>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => {
                    setQuestion(ex.question);
                    setGrade(ex.grade);
                    setSubject(ex.subject);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60"
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <p className={cn("text-[11px]", MUTED)}>
              Saatte 25 soru sınırı. Koç cevabı vermez — yolu açar.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-900 dark:text-sky-200">
          <strong>Bilgi:</strong> Koç çözüm vermez. Sana doğru soruları sorar;
          sen bulursun. 🎯
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {!result && !loading && !error ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 border-dashed py-14 text-center",
            )}
          >
            <Target className="size-10 text-brand-turquoise" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Hazır olduğunda rehberlik al
            </h3>
            <p className={cn("max-w-sm text-sm", MUTED)}>
              Soruyu yaz. Koç önce anladığını kontrol eder, sonra sana
              yönlendirici sorular ve adım adım ipuçları verir.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 py-14 text-center",
            )}
          >
            <Loader2 className="size-10 animate-spin text-brand-turquoise" />
            <p className={cn("text-sm", MUTED)}>Düşünülüyor…</p>
          </div>
        ) : null}

        {result ? (
          <>
            <div className={cn(CARD, "p-5")}>
              <p className={cn("mb-1 text-xs uppercase tracking-widest", MUTED)}>
                Soruyu böyle anlıyorum
              </p>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {result.understanding}
              </p>
            </div>

            <div className={cn(CARD, "p-5")}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <HelpCircle className="size-4 text-brand-turquoise" />
                Önce şunları netleştir
              </h3>
              <ul className="space-y-2">
                {result.clarifyingQuestions.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span className="mt-0.5 size-5 shrink-0 rounded-full bg-brand-turquoise/15 text-center text-xs font-bold leading-5 text-brand-turquoise">
                      {i + 1}
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn(CARD, "p-5")}>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Adım adım düşün
              </h3>
              <ol className="space-y-3">
                {result.hints.map((h) => (
                  <li
                    key={h.step}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-navy dark:text-brand-turquoise">
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-navy text-white dark:bg-brand-turquoise dark:text-brand-navy">
                        {h.step}
                      </span>
                      Yönlendirici soru
                    </p>
                    <p className="mb-1 font-medium text-slate-900 dark:text-slate-100">
                      {h.question}
                    </p>
                    <p className={cn("text-xs", MUTED)}>💡 {h.why}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className={cn(CARD, "p-5")}>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Bu soruda geçen kavramlar
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.concepts.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-2.5 py-1 text-xs font-medium text-brand-turquoise"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
              ✨ {result.encouragement}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
