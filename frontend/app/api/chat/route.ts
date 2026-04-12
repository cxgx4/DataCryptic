import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SITE_CONTEXT = `
You are the official AI assistant for FailVault (DataCrypt).

FailVault is a DeSci research marketplace where users publish failed or negative experiments.
- Research is encrypted (AES-256) and minted as IP-NFTs on Polygon Amoy.
- Unlocking data requires ETH/POL payment.
- All blockchain transactions are final.
- The platform uses Supabase for metadata storage and the Polygon blockchain for NFT minting.
- Users connect via MetaMask or Rabby wallet.
- Published research gets an AI-generated summary feature.
- Answer ONLY questions related to this platform.
- Keep responses concise and helpful.
`;

// Models to try in order — each has its own separate free-tier quota
const MODEL_CANDIDATES = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

async function tryGenerate(prompt: string): Promise<string> {
  let lastError: unknown;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number }).status;
      // If it's a quota/rate-limit error OR model not found, try the next model
      if (status === 429 || status === 404) {
        console.warn(`Model ${modelName} unavailable (${status}), trying next model...`);
        continue;
      }
      // For any other error, throw immediately
      throw err;
    }
  }

  // All models exhausted
  throw lastError;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const prompt = `${SITE_CONTEXT}\n\nUser Question: ${message}`;
    const reply = await tryGenerate(prompt);

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);

    const status = (error as { status?: number }).status;
    if (status === 429) {
      return NextResponse.json(
        { reply: "I'm currently experiencing high demand. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { reply: "I'm having trouble thinking right now. Please try again." },
      { status: 500 }
    );
  }
}
