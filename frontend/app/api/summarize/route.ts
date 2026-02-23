import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { findings, title } = await req.json();

        if (!findings) {
            return NextResponse.json(
                { reply: "No findings provided to summarize." },
                { status: 400 }
            );
        }

        const prompt = `You are a scientific research analyst for FailVault, a decentralized science platform focused on negative/failed research results.

Given the following research findings from a paper titled "${title || 'Untitled'}", provide a structured AI summary:

--- FINDINGS ---
${findings}
--- END ---

Respond in this exact format (use markdown):

## 🔬 Key Findings
- (2-3 bullet points summarizing the core results)

## ⚠️ Failure Points
- (What specifically failed or produced negative results)

## 💡 Scientific Implications
- (Why this negative result matters for future research)

## 📊 Methodology Assessment
- (Brief assessment of the experimental approach)

Keep the summary concise (under 200 words total). Be scientific but accessible.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const reply = response.text();

        return NextResponse.json({ summary: reply });
    } catch (error) {
        console.error("Summarize API Error:", error);
        return NextResponse.json(
            { summary: "Failed to generate summary. Please try again." },
            { status: 500 }
        );
    }
}
