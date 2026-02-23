import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const siteContext = `
You are the official AI assistant for FailVault (DataCrypt).

FailVault is a DeSci research marketplace where users publish failed or negative experiments.
- Research is encrypted (AES-256) and minted as IP-NFTs on Polygon Amoy.
- Unlocking data requires ETH/POL payment.
- All blockchain transactions are final.
- Answer ONLY questions related to this platform.
`;

    // Use gemini-1.5-flash for fast, free responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Combine context and user message into a single prompt
    const prompt = `${siteContext}\n\nUser Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { reply: "I'm having trouble thinking right now. Please try again." },
      { status: 500 }
    );
  }
}