// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./VirtualAssistant.module.css";

const FAQ_DATA = [
  {
    question: "What is DataCrypt / FailVault?",
    answer: "DataCrypt (FailVault) is a Decentralized Science (DeSci) research marketplace focused on negative and failed experiment results. It helps researchers monetize unused data by publishing it as encrypted NFTs on the blockchain."
  },
  {
    question: "How does it work?",
    answer: "1. Publish your research findings (they get encrypted with AES-256).\n2. Your work is minted as an IP-NFT on Polygon Amoy.\n3. Other researchers pay ETH/POL to unlock and read your findings.\n4. You earn money from each unlock."
  },
  {
    question: "What is an IP-NFT?",
    answer: "An IP-NFT (Intellectual Property NFT) is a blockchain token that represents ownership of research data. It ensures your work is permanently recorded, tamper-proof, and you maintain provenance over your discoveries."
  },
  {
    question: "How do I publish a paper?",
    answer: "1. Connect your wallet (MetaMask or Rabby).\n2. Click 'Publish Research' in the navbar.\n3. Fill in your title, abstract, and findings.\n4. Set a price and click 'Mint Research NFT'.\n5. Confirm the transaction in your wallet."
  },
  {
    question: "How do I unlock a paper?",
    answer: "On the home page, find the paper you want to read. Click 'Unlock for X ETH'. Confirm the payment in your wallet. Once confirmed, the encrypted findings will be decrypted and shown to you."
  },
  {
    question: "What network does it use?",
    answer: "DataCrypt operates on the Polygon Amoy Testnet. You'll need test POL/MATIC tokens (free from faucets) to pay for gas fees. No real money is required for testing."
  },
  {
    question: "Are transactions reversible?",
    answer: "No. All blockchain transactions on DataCrypt are final and irreversible. Once you pay to unlock a paper or mint an NFT, the transaction cannot be undone."
  },
  {
    question: "What is the AI Summarizer?",
    answer: "After unlocking a paper, you can click the '✨ AI Summary' button to get an AI-generated structured summary of the findings, including key results, failure points, and scientific implications."
  }
];

export default function VirtualAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("menu"); // "menu" | "faq" | "chat"
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm **Vera**, your DataCrypt research assistant. Ask me anything about the platform, blockchain, publishing, or unlocking papers!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goBack = () => {
    setMode("menu");
    setExpandedFaq(null);
  };

  return (
    <>
      {open && (
        <div className={styles.chatbot}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              {mode !== "menu" && (
                <button className={styles.backBtn} onClick={goBack}>←</button>
              )}
              <div>
                <div className={styles.name}>
                  {mode === "menu" ? "Vera" : mode === "faq" ? "FAQ" : "Chat with Vera"}
                </div>
                <div className={styles.subtitle}>
                  {mode === "menu" ? "DataCrypt Assistant" : mode === "faq" ? "Frequently Asked Questions" : "AI-Powered Support"}
                </div>
              </div>
            </div>
            <button className={styles.close} onClick={() => { setOpen(false); setMode("menu"); }}>✕</button>
          </div>

          {/* MENU MODE */}
          {mode === "menu" && (
            <div className={styles.menuBody}>
              <div className={styles.greeting}>
                <div className={styles.veraAvatar}>🤖</div>
                <p>Hi there! I'm <strong>Vera</strong>, your DataCrypt assistant. How can I help you today?</p>
              </div>

              <div className={styles.menuOptions}>
                <button className={styles.menuCard} onClick={() => setMode("faq")}>
                  <div className={styles.menuIcon}>📋</div>
                  <div>
                    <div className={styles.menuCardTitle}>FAQ</div>
                    <div className={styles.menuCardDesc}>Browse common questions about our platform</div>
                  </div>
                  <span className={styles.menuArrow}>→</span>
                </button>

                <button className={styles.menuCard} onClick={() => setMode("chat")}>
                  <div className={styles.menuIcon}>💬</div>
                  <div>
                    <div className={styles.menuCardTitle}>Chat with Agent</div>
                    <div className={styles.menuCardDesc}>Get real-time help from our AI assistant</div>
                  </div>
                  <span className={styles.menuArrow}>→</span>
                </button>
              </div>

              <div className={styles.menuFooter}>
                Powered by Gemini AI • Available 24/7
              </div>
            </div>
          )}

          {/* FAQ MODE */}
          {mode === "faq" && (
            <div className={styles.faqBody}>
              {FAQ_DATA.map((item, i) => (
                <div key={i} className={styles.faqItem}>
                  <button
                    className={`${styles.faqQuestion} ${expandedFaq === i ? styles.faqActive : ""}`}
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  >
                    <span>{item.question}</span>
                    <span className={styles.faqToggle}>{expandedFaq === i ? "−" : "+"}</span>
                  </button>
                  {expandedFaq === i && (
                    <div className={styles.faqAnswer}>
                      {item.answer.split("\n").map((line, j) => (
                        <p key={j}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CHAT MODE */}
          {mode === "chat" && (
            <>
              <div className={styles.messages}>
                {messages.map((msg, i) => (
                  <div key={i} className={msg.role === "user" ? styles.user : styles.bot}>
                    {msg.text.split("\n").map((line, j) => (
                      <p key={j}>{line.replace(/\*\*(.*?)\*\*/g, (_, m) => m)}</p>
                    ))}
                  </div>
                ))}
                {isTyping && (
                  <div className={styles.bot}>
                    <div className={styles.typing}>
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputBar}>
                <input
                  type="text"
                  placeholder="Ask Vera anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                />
                <button className={styles.send} onClick={sendMessage} disabled={isTyping || !input.trim()}>
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!open && (
        <button className={styles.fab} onClick={() => setOpen(true)}>
          💬
        </button>
      )}
    </>
  );
}

