import "server-only";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const Req = z.object({
  question: z.string().min(5).max(2000),
  grade: z.enum([
    "ilkokul-1-2",
    "ilkokul-3-4",
    "ortaokul-5-6",
    "ortaokul-7-8",
    "lise",
  ]),
  subject: z.enum([
    "matematik",
    "fen",
    "turkce",
    "sosyal",
    "ingilizce",
    "fizik",
    "kimya",
    "biyoloji",
    "tarih",
    "cografya",
    "diger",
  ]),
});

const Res = z.object({
  understanding: z.string(),
  clarifyingQuestions: z.array(z.string()).min(2).max(4),
  hints: z
    .array(
      z.object({
        step: z.number().int(),
        question: z.string(),
        why: z.string(),
      }),
    )
    .min(3)
    .max(6),
  concepts: z.array(z.string()).min(1).max(5),
  encouragement: z.string(),
});

const GRADE: Record<z.infer<typeof Req>["grade"], string> = {
  "ilkokul-1-2": "1-2. sınıf",
  "ilkokul-3-4": "3-4. sınıf",
  "ortaokul-5-6": "5-6. sınıf",
  "ortaokul-7-8": "7-8. sınıf",
  lise: "lise",
};

export async function POST(req: Request) {
  const limited = await rateLimit({
    action: "odev",
    windowMs: 60 * 60 * 1000,
    max: 25,
  });
  if (!limited.ok) {
    return json({ error: "Saatte en fazla 25 soru." }, 429);
  }
  let body: z.infer<typeof Req>;
  try {
    body = Req.parse(await req.json());
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const system = [
    "Sen deneyimli bir öğretmensin. ÖĞRENCİNİN ÖDEVİNİ ASLA DOĞRUDAN ÇÖZMEZSİN.",
    "Sokratik yöntemi kullan: öğrenciye soru sorarak, ipuçlarıyla yol gösterirsin. Sonucu söylemek YERİNE adım adım DÜŞÜNDÜRÜRSÜN.",
    "Çıktı JSON şemasına uygun olmalı:",
    "understanding: Soruyu kendi cümlenle 1-2 cümlede özetle (öğrenci anladığını doğrulasın).",
    "clarifyingQuestions: 2-4 netleştirici soru. Örn: 'Hangi bilgiler verilmiş?'",
    "hints: 3-6 adım. Her adım {step, question, why} içerir — question öğrencinin kendini bulacağı yönlendirici soru; why o adımın neden önemli olduğunun kısa açıklaması.",
    "concepts: Konunun ana kavramları (1-5 madde).",
    "encouragement: 'Yapabilirsin!' cinsinden 1 cümlelik motivasyon.",
    "SAKIN cevabı ifşa etme. İpuçlarını sonuca ulaşmak için küçük sorular şeklinde ver.",
    `Öğrencinin sınıf seviyesi: ${GRADE[body.grade]}. Ders: ${body.subject}.`,
    "Yazı stili yaşa uygun, sıcak ve cesaret verici olmalı.",
  ].join(" ");

  const prompt = `Öğrenci sorusu: ${body.question}`;

  try {
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: Res,
      system,
      prompt,
      temperature: 0.5,
    });
    return json(object);
  } catch (err) {
    console.error("[odev] failed:", err);
    return json({ error: "Rehberlik üretilemedi." }, 502);
  }
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
