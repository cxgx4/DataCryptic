// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { supabase } from "./lib/supabaseClient";
import {
  Search, Lock, Unlock, Beaker, FileText, User, Calendar,
  Shield, Wallet, Eye, ArrowRight, Activity, Globe,
  Twitter, Github, Linkedin, Mail, MapPin, Database, Server,
  Star, Target, Moon, Flag, X, AlertTriangle, CheckCircle2,
  ThumbsUp, ThumbsDown, MessageCircle, Send, Reply,
  SlidersHorizontal, ChevronDown, ChevronUp, Filter
} from "lucide-react";

// --- CONFIGURATION ---
const ADMIN_ADDRESS = "0x09aa54130858C1B6d82243FC12536A684221DC46";

// --- COLOR PALETTE ---
const primaryGradient = "bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#2DD4BF]";
const textGradient = "text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#C4B5FD] to-[#2DD4BF]";
const subtleGlow = "shadow-[0_0_30px_rgba(167,139,250,0.15)]";
const glassBase = "backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 transition-all duration-300";

// --- REPORT REASONS ---
const REPORT_REASONS = [
  { id: "false_data", label: "False or Fabricated Data", icon: "⚠️" },
  { id: "plagiarism", label: "Plagiarism / Duplicate Content", icon: "📋" },
  { id: "misleading", label: "Misleading Conclusions", icon: "🚫" },
  { id: "inappropriate", label: "Inappropriate or Harmful Content", icon: "🔞" },
  { id: "spam", label: "Spam / Promotional Content", icon: "📢" },
  { id: "other", label: "Other Issue", icon: "💬" },
];

// --- STAR RATING COMPONENT ---
const StarRating = ({ value = 0, onChange, readonly = false, size = "md" }) => {
  const [hover, setHover] = useState(0);
  const sz = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
        >
          <Star
            className={`${sz} transition-colors ${
              (hover || value) >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-slate-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// --- ANIMATED MARQUEE ---
const MarqueeColumn = ({ children, duration = "60s", reverse = false }) => (
  <div className="relative flex flex-col overflow-visible h-[140vh] -my-40">
    <div
      className={`flex flex-col gap-8 animate-scroll ${reverse ? "flex-col-reverse" : ""}`}
      style={{ animationDuration: duration }}
    >
      {children}{children}{children}
    </div>
    <style jsx>{`
      @keyframes scroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(-66.666%); }
      }
      .animate-scroll { animation: scroll linear infinite; will-change: transform; }
    `}</style>
  </div>
);

// --- ANIMATED COUNTER ---
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime, frame;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = ts - startTime;
      if (progress < duration) {
        setCount(Math.min(end, Math.floor((progress / duration) * end)));
        frame = requestAnimationFrame(animate);
      } else { setCount(end); }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return <span>{count}</span>;
};

// --- HERO PAPER CARD ---
const PaperCard = ({ title, abstract, date, id, category }) => (
  <div className="w-64 flex-shrink-0 bg-gradient-to-br from-[#121230] to-[#1E1B4B] backdrop-blur-xl rounded-xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-[#A78BFA]/20 text-white transform transition-all hover:scale-105 duration-500 hover:shadow-[0_0_40px_rgba(167,139,250,0.4)] group cursor-default hover:border-[#2DD4BF]/30 overflow-visible">
    <div className="flex justify-between items-center mb-3 border-b border-[#312E81]/30 pb-2">
      <span className="text-[9px] font-bold uppercase tracking-widest text-[#C4B5FD]">Ref #{id}</span>
      <span className="text-[9px] font-mono text-[#94A3B8]">{date}</span>
    </div>
    <div className="h-1 w-8 bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] mb-3 rounded-full opacity-80" />
    <h3 className="font-sans text-lg font-bold leading-tight mb-3 text-white line-clamp-2 min-h-[3.5rem]">{title}</h3>
    <p className="font-sans text-[10px] leading-relaxed text-[#CBD5E1] text-justify line-clamp-4 min-h-[4.8rem]">{abstract}</p>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-full bg-[#A78BFA]/30 border border-[#A78BFA]/50" />
        <div className="w-3 h-3 rounded-full bg-[#7C3AED]/30 -ml-1.5 border border-[#7C3AED]/50" />
      </div>
      <div className="text-[8px] font-black tracking-wider text-[#2DD4BF] border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2 py-0.5 rounded-full">{category || "ENCRYPTED"}</div>
    </div>
  </div>
);

// --- STAT CARD ---
const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colors = {
    lavender: "text-[#A78BFA] border-[#A78BFA]/30 bg-[#A78BFA]/10",
    violet: "text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10",
    teal: "text-[#2DD4BF] border-[#2DD4BF]/30 bg-[#2DD4BF]/10",
  };
  const activeStyle = colors[color] || colors.lavender;
  return (
    <div className="relative group h-full w-full">
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-transparent via-[#A78BFA]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />
      <div className="relative bg-gradient-to-br from-[#121230]/60 to-[#1E1B4B]/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-start gap-4 hover:-translate-y-1 transition-all duration-300 shadow-xl h-36 justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${activeStyle}`}><Icon className="w-6 h-6" /></div>
          {subtext && (
            <div className="flex items-center gap-1.5 bg-[#2DD4BF]/10 border border-[#2DD4BF]/40 px-2.5 py-1 rounded-full animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
              </span>
              <span className="text-[9px] font-bold text-[#2DD4BF] uppercase tracking-wider">{subtext}</span>
            </div>
          )}
        </div>
        <div className="w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">{label}</p>
          <h3 className="text-3xl font-black text-white leading-none">
            {typeof value === "number" ? <AnimatedCounter end={value} /> : value}
          </h3>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// MAIN PAGE COMPONENT
// =====================================================================
export default function SearchPage() {
  // --- Existing State ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [experiments, setExperiments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [aiSummaries, setAiSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState({});

  // --- Report State ---
  const [reportModal, setReportModal] = useState({ open: false, expId: null, expTitle: "" });
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // --- Filter State ---
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "", dateTo: "", priceMin: "", priceMax: "",
    verified: "all", authorWallet: "",
  });

  // --- Vote State ---
  const [votes, setVotes] = useState({});

  // --- Discussion / Review State ---
  const [activeTab, setActiveTab] = useState({}); // { [expId]: null | 'discussion' | 'reviews' }
  const [comments, setComments] = useState({});
  const [reviews, setReviews] = useState({});
  const [loadingTab, setLoadingTab] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [replyTo, setReplyTo] = useState(null); // { expId, commentId, authorWallet }
  const [replyInput, setReplyInput] = useState("");
  const [reviewDraft, setReviewDraft] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [submittingReview, setSubmittingReview] = useState({});

  const categories = ["All", "Physics", "Chemistry", "Biology", "AI/ML", "Engineering", "Medicine"];

  // ── Hero carousel dummy data ──────────────────────────────────────
  const dummyData1 = [
    { id: 801, title: "Anomalies in Quantum Hall Effect at 4K", abstract: "Observed unexpected resistance plateaus that deviate from standard topological insulator models.", date: "Oct 2025", category: "Physics" },
    { id: 802, title: "Failed Synthesis of Carbon Nanoribbons", abstract: "Chemical vapor deposition resulted in amorphous carbon clusters rather than structured ribbons.", date: "Sept 2025", category: "Chemistry" },
    { id: 803, title: "CRISPR-Cas9 Off-Target Mutations", abstract: "High frequency of indel mutations found in non-target loci of the murine genome.", date: "Nov 2025", category: "Biology" },
    { id: 804, title: "Superconductivity Failure in Cuprates", abstract: "Expected superconducting transition absent despite optimal doping levels.", date: "Aug 2025", category: "Physics" },
    { id: 805, title: "Protein Folding Algorithm Divergence", abstract: "Deep learning model consistently produced unrealistic tertiary structures.", date: "July 2025", category: "AI/ML" },
    { id: 806, title: "Catalyst Deactivation in Methanol Synthesis", abstract: "Rapid loss of catalytic activity observed within first 24 hours.", date: "Dec 2025", category: "Chemistry" },
    { id: 807, title: "Neural Interface Signal Degradation", abstract: "Implantable electrodes showed 60% signal loss after 30 days in primate trials.", date: "Jan 2026", category: "Medicine" },
    { id: 808, title: "Quantum Gate Decoherence Times", abstract: "Measured coherence times 50% below theoretical predictions.", date: "Mar 2025", category: "Physics" },
    { id: 809, title: "Enzyme Thermostability Limits", abstract: "Engineered enzymes denatured at temperatures 15°C below predictions.", date: "Feb 2025", category: "Biology" },
    { id: 810, title: "GAN Training Mode Collapse", abstract: "Generator converged to single output mode despite extensive hyperparameter optimization.", date: "Apr 2025", category: "AI/ML" },
  ];
  const dummyData2 = [
    { id: 901, title: "Neural Net Mode Collapse in GANs", abstract: "Generator network consistently converged to a single output despite hyperparameter tuning.", date: "Aug 2025", category: "AI/ML" },
    { id: 902, title: "Perovskite Solar Cell Instability", abstract: "Rapid degradation of efficiency observed under high humidity within 24 hours.", date: "July 2025", category: "Engineering" },
    { id: 903, title: "Superconductor Phase Transition Failure", abstract: "Material remained insulative despite theoretical predictions at high pressure.", date: "Oct 2025", category: "Physics" },
    { id: 904, title: "Antibiotic Resistance Mechanism", abstract: "Novel compound showed no bactericidal effect against multi-drug resistant strains.", date: "June 2025", category: "Medicine" },
    { id: 905, title: "Battery Cycle Life Degradation", abstract: "Solid-state batteries lost 40% capacity after 200 cycles.", date: "May 2025", category: "Engineering" },
    { id: 906, title: "Gene Drive Population Dynamics", abstract: "Unexpectedly rapid resistance evolution observed in mosquito populations.", date: "Sept 2025", category: "Biology" },
    { id: 907, title: "Reinforcement Learning Reward Hacking", abstract: "Agent discovered unintended loopholes to maximize reward.", date: "Nov 2025", category: "AI/ML" },
    { id: 908, title: "Carbon Capture Adsorbent Regeneration", abstract: "Material failed to regenerate completely after 5 cycles.", date: "Aug 2025", category: "Chemistry" },
    { id: 909, title: "Tissue Engineering Scaffold Rejection", abstract: "Biocompatible polymer triggered unexpected immune response.", date: "Oct 2025", category: "Medicine" },
    { id: 910, title: "Optical Computing Gate Crosstalk", abstract: "Photon leakage between adjacent gates exceeded acceptable thresholds by 300%.", date: "Dec 2025", category: "Engineering" },
  ];
  const dummyData3 = [
    { id: 1001, title: "Topological Insulator Surface States", abstract: "Predicted conducting surface states were not observed in ARPES measurements.", date: "Jan 2026", category: "Physics" },
    { id: 1002, title: "Enzyme Cascade Optimization Failure", abstract: "Multi-enzyme system showed inhibitory cross-talk.", date: "Feb 2026", category: "Biology" },
    { id: 1003, title: "Transformer Model Overfitting", abstract: "Attention mechanism memorized training data rather than generalizing.", date: "Mar 2026", category: "AI/ML" },
    { id: 1004, title: "Hydrogen Storage Material Kinetics", abstract: "Absorption/desorption rates 100x slower than DFT calculations predicted.", date: "Apr 2026", category: "Chemistry" },
    { id: 1005, title: "CRISPR Base Editing Efficiency", abstract: "Single-base editing showed <5% efficiency in human stem cells.", date: "May 2026", category: "Biology" },
    { id: 1006, title: "Quantum Error Correction Threshold", abstract: "Error rates remained above fault-tolerance threshold.", date: "June 2026", category: "Physics" },
    { id: 1007, title: "Drug Delivery Nanoparticle Clearance", abstract: "Targeted nanoparticles accumulated in liver rather than tumor sites.", date: "July 2026", category: "Medicine" },
    { id: 1008, title: "Self-Healing Polymer Limitations", abstract: "Healing efficiency dropped below 30% after third damage-repair cycle.", date: "Aug 2026", category: "Engineering" },
    { id: 1009, title: "Metamaterial Negative Refraction", abstract: "Fabricated structures showed positive refraction across tested frequencies.", date: "Sept 2026", category: "Physics" },
    { id: 1010, title: "Microbiome Transplantation Stability", abstract: "Donor microbiome failed to establish persistent colonization.", date: "Oct 2026", category: "Biology" },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────
  useEffect(() => {
    checkWallet();
    loadExperiments();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) { setWalletAddress(accounts[0]); checkAdminStatus(accounts[0]); }
        else { setWalletAddress(""); setIsAdmin(false); }
      });
    }
  }, []);

  useEffect(() => {
    if (experiments.length > 0) loadVotes(experiments.map((e) => e.id));
  }, [experiments, walletAddress]);

  // ── Wallet ────────────────────────────────────────────────────────
  const checkAdminStatus = (address) =>
    setIsAdmin(address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase());

  const checkWallet = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) { setWalletAddress(accounts[0]); checkAdminStatus(accounts[0]); }
    } catch (err) { console.error(err); }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletAddress(accounts[0]);
    checkAdminStatus(accounts[0]);
  };

  // ── Experiments ───────────────────────────────────────────────────
  const loadExperiments = async () => {
    setIsLoading(true);
    const { data: papers, error } = await supabase
      .from("experiments").select("*").order("created_at", { ascending: false });
    if (error) console.error("Supabase error:", error);
    const myUnlocks = JSON.parse(localStorage.getItem("myUnlockedIds") || "[]");
    if (papers) setExperiments(papers.map((p) => ({ ...p, isUnlocked: myUnlocks.includes(p.id) })));
    setIsLoading(false);
  };

  const unlockPaper = async (experiment) => {
    if (!window.ethereum) return alert("Install Metamask");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const recipient = experiment.wallet_address || ADMIN_ADDRESS;
      const feeData = await provider.getFeeData();
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther("0.0001"),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
          ? (feeData.maxPriorityFeePerGas * 2n > ethers.parseUnits("30", "gwei")
            ? feeData.maxPriorityFeePerGas * 2n
            : ethers.parseUnits("30", "gwei"))
          : ethers.parseUnits("35", "gwei"),
        maxFeePerGas: feeData.maxFeePerGas
          ? (feeData.maxFeePerGas * 2n > ethers.parseUnits("60", "gwei")
            ? feeData.maxFeePerGas * 2n
            : ethers.parseUnits("60", "gwei"))
          : ethers.parseUnits("70", "gwei"),
      });
      alert("Transaction Sent! Waiting for confirmation...");
      await tx.wait();
      const myUnlocks = JSON.parse(localStorage.getItem("myUnlockedIds") || "[]");
      localStorage.setItem("myUnlockedIds", JSON.stringify([...myUnlocks, experiment.id]));
      setExperiments((prev) => prev.map((exp) => exp.id === experiment.id ? { ...exp, isUnlocked: true } : exp));
    } catch (error) { console.error(error); alert("Payment Error: " + error.message); }
  };

  // ── Votes ─────────────────────────────────────────────────────────
  const loadVotes = async (expIds) => {
    if (!expIds.length) return;
    try {
      const { data, error } = await supabase
        .from("votes").select("experiment_id, vote_type, voter_wallet").in("experiment_id", expIds);
      if (error) throw error;
      const map = {};
      expIds.forEach((id) => { map[id] = { ups: 0, downs: 0, userVote: null }; });
      (data || []).forEach((v) => {
        if (!map[v.experiment_id]) map[v.experiment_id] = { ups: 0, downs: 0, userVote: null };
        if (v.vote_type === "up") map[v.experiment_id].ups++;
        else map[v.experiment_id].downs++;
        if (walletAddress && v.voter_wallet?.toLowerCase() === walletAddress.toLowerCase())
          map[v.experiment_id].userVote = v.vote_type;
      });
      setVotes(map);
    } catch {
      const stored = JSON.parse(localStorage.getItem("dc_votes") || "{}");
      setVotes(stored);
    }
  };

  const submitVote = async (expId, type) => {
    if (!walletAddress) return;
    const currentVote = votes[expId]?.userVote;
    const isToggleOff = currentVote === type;
    // Optimistic update
    setVotes((prev) => {
      const cur = prev[expId] || { ups: 0, downs: 0, userVote: null };
      let { ups, downs } = cur;
      if (isToggleOff) {
        if (type === "up") ups = Math.max(0, ups - 1); else downs = Math.max(0, downs - 1);
        return { ...prev, [expId]: { ups, downs, userVote: null } };
      }
      if (currentVote === "up") ups = Math.max(0, ups - 1);
      if (currentVote === "down") downs = Math.max(0, downs - 1);
      if (type === "up") ups++; else downs++;
      return { ...prev, [expId]: { ups, downs, userVote: type } };
    });
    try {
      if (isToggleOff) {
        await supabase.from("votes").delete().eq("experiment_id", expId).eq("voter_wallet", walletAddress);
      } else {
        await supabase.from("votes").upsert(
          { experiment_id: expId, voter_wallet: walletAddress, vote_type: type },
          { onConflict: "experiment_id,voter_wallet" }
        );
      }
    } catch {
      const stored = JSON.parse(localStorage.getItem("dc_votes") || "{}");
      stored[expId] = votes[expId];
      localStorage.setItem("dc_votes", JSON.stringify(stored));
    }
  };

  // ── Discussion ────────────────────────────────────────────────────
  const toggleTab = async (expId, tab) => {
    const current = activeTab[expId];
    const next = current === tab ? null : tab;
    setActiveTab((prev) => ({ ...prev, [expId]: next }));
    if (next === "discussion" && !comments[expId]) await loadComments(expId);
    if (next === "reviews" && !reviews[expId]) await loadReviews(expId);
  };

  const loadComments = async (expId) => {
    setLoadingTab((prev) => ({ ...prev, [`${expId}_d`]: true }));
    try {
      const { data, error } = await supabase
        .from("comments").select("*").eq("experiment_id", expId).order("created_at", { ascending: true });
      if (error) throw error;
      setComments((prev) => ({ ...prev, [expId]: data || [] }));
    } catch {
      const stored = JSON.parse(localStorage.getItem("dc_comments") || "{}");
      setComments((prev) => ({ ...prev, [expId]: stored[expId] || [] }));
    } finally {
      setLoadingTab((prev) => ({ ...prev, [`${expId}_d`]: false }));
    }
  };

  const submitComment = async (expId, content, parentId = null) => {
    if (!content?.trim() || !walletAddress) return;
    setSubmittingComment((prev) => ({ ...prev, [expId]: true }));
    const optimistic = {
      id: `local-${Date.now()}`, experiment_id: expId,
      author_wallet: walletAddress, content: content.trim(),
      parent_id: parentId, created_at: new Date().toISOString(),
    };
    setComments((prev) => ({ ...prev, [expId]: [...(prev[expId] || []), optimistic] }));
    if (parentId) { setReplyTo(null); setReplyInput(""); }
    else setCommentInput((prev) => ({ ...prev, [expId]: "" }));
    try {
      const { data, error } = await supabase.from("comments")
        .insert([{ experiment_id: expId, author_wallet: walletAddress, content: content.trim(), parent_id: parentId }])
        .select().single();
      if (error) throw error;
      setComments((prev) => ({
        ...prev,
        [expId]: prev[expId].map((c) => (c.id === optimistic.id ? data : c)),
      }));
    } catch {
      const stored = JSON.parse(localStorage.getItem("dc_comments") || "{}");
      stored[expId] = [...(stored[expId] || []), optimistic];
      localStorage.setItem("dc_comments", JSON.stringify(stored));
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [expId]: false }));
    }
  };

  // ── Reviews ───────────────────────────────────────────────────────
  const loadReviews = async (expId) => {
    setLoadingTab((prev) => ({ ...prev, [`${expId}_r`]: true }));
    try {
      const { data, error } = await supabase
        .from("reviews").select("*").eq("experiment_id", expId).order("created_at", { ascending: false });
      if (error) throw error;
      setReviews((prev) => ({ ...prev, [expId]: data || [] }));
    } catch {
      const stored = JSON.parse(localStorage.getItem("dc_reviews") || "{}");
      setReviews((prev) => ({ ...prev, [expId]: stored[expId] || [] }));
    } finally {
      setLoadingTab((prev) => ({ ...prev, [`${expId}_r`]: false }));
    }
  };

  const submitReview = async (expId) => {
    const draft = reviewDraft[expId];
    if (!draft?.overall || !walletAddress) return;
    setSubmittingReview((prev) => ({ ...prev, [expId]: true }));
    const optimistic = {
      id: `local-${Date.now()}`, experiment_id: expId,
      reviewer_wallet: walletAddress,
      overall_rating: draft.overall,
      methodology_rating: draft.methodology || null,
      data_quality_rating: draft.dataQuality || null,
      review_text: draft.text || "",
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => ({ ...prev, [expId]: [optimistic, ...(prev[expId] || [])] }));
    setReviewDraft((prev) => ({ ...prev, [expId]: null }));
    try {
      await supabase.from("reviews").insert([{
        experiment_id: expId, reviewer_wallet: walletAddress,
        overall_rating: draft.overall,
        methodology_rating: draft.methodology || null,
        data_quality_rating: draft.dataQuality || null,
        review_text: draft.text || "",
      }]);
    } catch {
      const stored = JSON.parse(localStorage.getItem("dc_reviews") || "{}");
      stored[expId] = [optimistic, ...(stored[expId] || [])];
      localStorage.setItem("dc_reviews", JSON.stringify(stored));
    } finally {
      setSubmittingReview((prev) => ({ ...prev, [expId]: false }));
    }
  };

  // ── Report ────────────────────────────────────────────────────────
  const openReport = (expId, expTitle) => {
    setReportModal({ open: true, expId, expTitle });
    setReportReason(""); setReportDetails(""); setReportSuccess(false);
  };
  const closeReport = () => {
    setReportModal({ open: false, expId: null, expTitle: "" });
    setReportReason(""); setReportDetails(""); setReportSuccess(false);
  };
  const submitReport = async () => {
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const { error } = await supabase.from("reports").insert([{
        experiment_id: reportModal.expId, reason: reportReason,
        details: reportDetails, reporter_wallet: walletAddress || "anonymous",
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;
    } catch {
      const stored = JSON.parse(localStorage.getItem("pendingReports") || "[]");
      stored.push({ experiment_id: reportModal.expId, reason: reportReason, details: reportDetails, reporter_wallet: walletAddress || "anonymous", created_at: new Date().toISOString() });
      localStorage.setItem("pendingReports", JSON.stringify(stored));
    } finally {
      setReportSubmitting(false);
      setReportSuccess(true);
      setTimeout(() => closeReport(), 2500);
    }
  };

  // ── Comment tree helpers ──────────────────────────────────────────
  const buildCommentTree = (flat) => {
    const map = {};
    const roots = [];
    (flat || []).forEach((c) => { map[c.id] = { ...c, replies: [] }; });
    (flat || []).forEach((c) => {
      if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies.push(map[c.id]);
      else roots.push(map[c.id]);
    });
    return roots;
  };

  const renderComment = (comment, expId, depth = 0) => {
    const isReplyingToThis = replyTo?.commentId === comment.id && replyTo?.expId === expId;
    const shortWallet = `${comment.author_wallet?.slice(0, 6)}...${comment.author_wallet?.slice(-4)}`;
    const dateStr = new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const avatarLetters = comment.author_wallet?.slice(2, 4).toUpperCase() || "??";
    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-6 border-l-2 border-[#312E81]/60 pl-4" : ""} mt-3`}>
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 hover:border-white/12 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#2DD4BF] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                {avatarLetters}
              </div>
              <span className="text-xs font-mono text-[#A78BFA]">{shortWallet}</span>
              <span className="text-[10px] text-[#475569]">{dateStr}</span>
            </div>
            {depth < 3 && walletAddress && (
              <button
                onClick={() => setReplyTo(isReplyingToThis ? null : { expId, commentId: comment.id, authorWallet: comment.author_wallet })}
                className="flex items-center gap-1 text-[10px] text-[#94A3B8] hover:text-[#A78BFA] transition-colors"
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
            )}
          </div>
          <p className="text-sm text-[#CBD5E1] leading-relaxed">{comment.content}</p>
        </div>

        {isReplyingToThis && (
          <div className="mt-2 flex gap-2 ml-2">
            <input
              autoFocus
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(expId, replyInput, comment.id); } }}
              placeholder={`Reply to ${shortWallet}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#CBD5E1] placeholder:text-[#475569] focus:outline-none focus:border-[#A78BFA]/40 transition-colors"
            />
            <button onClick={() => submitComment(expId, replyInput, comment.id)}
              className="px-3 py-2 rounded-lg bg-[#A78BFA]/20 border border-[#A78BFA]/30 text-[#A78BFA] hover:bg-[#A78BFA]/30 transition-all">
              <Send className="w-4 h-4" />
            </button>
            <button onClick={() => { setReplyTo(null); setReplyInput(""); }}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#94A3B8] hover:bg-white/10 transition-all text-xs">
              Cancel
            </button>
          </div>
        )}
        {comment.replies?.map((reply) => renderComment(reply, expId, depth + 1))}
      </div>
    );
  };

  // ── Filter logic ──────────────────────────────────────────────────
  const activeFilterCount = [
    filters.dateFrom, filters.dateTo, filters.priceMin, filters.priceMax,
    filters.verified !== "all" ? filters.verified : "",
    filters.authorWallet,
  ].filter(Boolean).length;

  const clearFilters = () =>
    setFilters({ dateFrom: "", dateTo: "", priceMin: "", priceMax: "", verified: "all", authorWallet: "" });

  const filtered = experiments.filter((exp) => {
    if (activeCategory !== "All" && (exp.category || "Physics") !== activeCategory) return false;
    if (searchTerm && !exp.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !exp.abstract.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.dateFrom && exp.created_at && new Date(exp.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && exp.created_at && new Date(exp.created_at) > new Date(filters.dateTo + "T23:59:59")) return false;
    const price = parseFloat(exp.price || "0");
    if (filters.priceMin !== "" && price < parseFloat(filters.priceMin)) return false;
    if (filters.priceMax !== "" && price > parseFloat(filters.priceMax)) return false;
    if (filters.verified === "verified" && !exp.verified) return false;
    if (filters.verified === "unverified" && exp.verified) return false;
    if (filters.authorWallet && !(exp.wallet_address || "").toLowerCase().includes(filters.authorWallet.toLowerCase())) return false;
    return true;
  });

  // ── Average rating helper ─────────────────────────────────────────
  const avgRating = (expId) => {
    const r = reviews[expId];
    if (!r?.length) return null;
    return (r.reduce((s, rev) => s + rev.overall_rating, 0) / r.length).toFixed(1);
  };

  // =================================================================
  // RENDER
  // =================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1E] via-[#0F0F2A] to-[#0A0A1E] text-gray-100 font-sans overflow-x-hidden relative">

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050514]">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-30"
            style={{ background: "radial-gradient(circle, #4C1D95 0%, transparent 70%)", top: "10%", left: "5%", animation: "float-slow 25s infinite ease-in-out" }} />
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-25"
            style={{ background: "radial-gradient(circle, #0D9488 0%, transparent 70%)", bottom: "15%", right: "10%", animation: "float-slow 20s infinite ease-in-out reverse" }} />
          <div className="absolute w-[1000px] h-[1000px] rounded-full blur-[120px] opacity-10"
            style={{ background: "radial-gradient(circle, #1E1B4B 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        </div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(to right, #A78BFA 1px, transparent 1px), linear-gradient(to bottom, #A78BFA 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }} />
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full bg-gradient-to-b from-[#0A0A1E]/95 via-[#0A0A1E]/90 to-transparent z-50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${subtleGlow} bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] group-hover:scale-105 transition-all`}>
              <Beaker className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] bg-clip-text text-transparent">DataCrypt</span>
              <span className="text-xs text-[#94A3B8] tracking-widest">COSMIC ARCHIVE</span>
            </div>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/publish">
              <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#121230] to-[#1E1B4B] border border-[#312E81] text-[#CBD5E1] hover:text-white hover:border-[#A78BFA] hover:shadow-[0_0_25px_rgba(167,139,250,0.4)] transition-all">
                <FileText className="w-4 h-4" /> Publish Research
              </button>
            </Link>
            {walletAddress && (
              <Link href="/profile">
                <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#121230] to-[#1E1B4B] border border-[#312E81] text-[#CBD5E1] hover:text-white hover:border-[#2DD4BF] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] transition-all">
                  <User className="w-4 h-4" /> My Profile
                </button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin">
                <button className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition-all animate-pulse">
                  <Shield className="w-4 h-4" /> Admin Portal
                </button>
              </Link>
            )}
            {walletAddress ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md hover:border-[#A78BFA]/30 transition-colors">
                <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                <span className="text-gray-300 text-xs font-mono">{walletAddress.slice(0, 6)}...</span>
              </div>
            ) : (
              <button onClick={connectWallet} className={`flex items-center gap-2 ${primaryGradient} text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-[#A78BFA]/20`}>
                <Wallet className="w-4 h-4" /> Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-[100vh] flex items-center pt-20 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full relative h-full items-center">
          <div className="flex flex-col justify-center relative z-20 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 self-start bg-gradient-to-r from-[#A78BFA]/15 to-[#2DD4BF]/10 border border-[#A78BFA]/20 rounded-full px-4 py-1.5 mb-8 mt-12 backdrop-blur-md cursor-default">
              <Star className="w-3 h-3 text-[#C4B5FD]" />
              <span className="text-xs font-bold text-[#C4B5FD] uppercase tracking-widest">Decentralized Science</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[1.1] text-white">
              Research that <br />
              <span className={textGradient}>Transcends Failure</span>
            </h1>
            <p className="text-lg text-[#CBD5E1] mb-10 leading-relaxed max-w-lg border-l-2 border-[#A78BFA]/50 pl-6 bg-[#121230]/30 p-4 rounded-xl">
              The world's first decentralized archive for negative results. Turn scientific dead-ends into valuable knowledge assets.
            </p>
            <div className="relative group max-w-lg mb-10">
              <div className={`absolute -inset-1 ${primaryGradient} rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-1000`} />
              <div className={`relative p-[1px] rounded-xl ${primaryGradient}`}>
                <div className="relative flex items-center bg-gradient-to-br from-[#121230]/80 to-[#1E1B4B]/60 rounded-xl p-1">
                  <Search className="w-5 h-5 text-[#94A3B8] ml-4" />
                  <input type="text" placeholder="Search experiments, domains, or authors..."
                    className="w-full bg-transparent p-4 text-white placeholder-[#94A3B8] focus:outline-none"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <button className="bg-gradient-to-r from-[#A78BFA]/20 to-[#2DD4BF]/20 text-white p-2.5 rounded-lg transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg w-full">
              <StatCard icon={Database} label="Experiments" value={experiments.length > 0 ? experiments.length : 124} color="lavender" />
              <StatCard icon={Server} label="Network Nodes" value={843} color="violet" />
              <StatCard icon={Activity} label="Live Status" value="Online" subtext="Live" color="teal" />
            </div>
          </div>
          <div className="relative h-[80vh] flex justify-center items-center z-10 order-1 lg:order-2 overflow-visible">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[180%] flex gap-6 rotate-[8deg] scale-90 lg:scale-100 pointer-events-none opacity-90 overflow-visible">
              <div className="relative flex flex-col overflow-visible">
                <MarqueeColumn duration="70s">{dummyData1.map((p, i) => <PaperCard key={`c1-${i}`} {...p} />)}</MarqueeColumn>
              </div>
              <div className="relative flex flex-col overflow-visible mt-20">
                <MarqueeColumn duration="55s" reverse>{dummyData2.map((p, i) => <PaperCard key={`c2-${i}`} {...p} />)}</MarqueeColumn>
              </div>
              <div className="relative flex flex-col overflow-visible">
                <MarqueeColumn duration="65s">{dummyData3.map((p, i) => <PaperCard key={`c3-${i}`} {...p} />)}</MarqueeColumn>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESULTS SECTION ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-20">

        {/* Section header + category pills */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 pb-8 border-b border-white/5">
          <div>
            <h2 className="text-4xl font-bold flex items-center gap-3 mb-2 text-white">
              <Target className="text-[#2DD4BF] w-8 h-8 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
              <span className={textGradient}>Recent Archives</span>
            </h2>
            <p className="text-[#CBD5E1]">Discover the latest verified scientific contributions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = cat === "All" ? experiments.length : experiments.filter((e) => (e.category || "Physics") === cat).length;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-sm ${activeCategory === cat
                    ? `${primaryGradient} border-transparent text-white shadow-lg shadow-[#A78BFA]/20`
                    : "bg-gradient-to-r from-[#121230]/60 to-[#1E1B4B]/60 border-[#312E81]/30 text-[#94A3B8] hover:border-[#A78BFA]/30 hover:text-white"}`}>
                  {cat} <span className="ml-1 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FILTER TOGGLE + PANEL ──────────────────────────────────── */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-semibold backdrop-blur-sm ${showFilters
              ? `${primaryGradient} border-transparent text-white`
              : "bg-white/5 border-white/10 text-[#CBD5E1] hover:border-[#A78BFA]/40 hover:text-white"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mb-8 bg-gradient-to-br from-[#121230]/80 to-[#1E1B4B]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Date From */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">From Date</label>
                <input type="date" value={filters.dateFrom}
                  onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
                  className="w-full bg-[#0A0A1E]/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#CBD5E1] focus:outline-none focus:border-[#A78BFA]/40 transition-colors" />
              </div>
              {/* Date To */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">To Date</label>
                <input type="date" value={filters.dateTo}
                  onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
                  className="w-full bg-[#0A0A1E]/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#CBD5E1] focus:outline-none focus:border-[#A78BFA]/40 transition-colors" />
              </div>
              {/* Price Min */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Min Price (ETH)</label>
                <input type="number" step="0.0001" placeholder="0" value={filters.priceMin}
                  onChange={(e) => setFilters((p) => ({ ...p, priceMin: e.target.value }))}
                  className="w-full bg-[#0A0A1E]/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#CBD5E1] focus:outline-none focus:border-[#A78BFA]/40 transition-colors" />
              </div>
              {/* Price Max */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Max Price (ETH)</label>
                <input type="number" step="0.0001" placeholder="Any" value={filters.priceMax}
                  onChange={(e) => setFilters((p) => ({ ...p, priceMax: e.target.value }))}
                  className="w-full bg-[#0A0A1E]/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#CBD5E1] focus:outline-none focus:border-[#A78BFA]/40 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verification Status */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Verification Status</label>
                <div className="flex gap-2">
                  {[{ id: "all", label: "All" }, { id: "verified", label: "✓ Verified" }, { id: "unverified", label: "○ Unverified" }].map((v) => (
                    <button key={v.id} onClick={() => setFilters((p) => ({ ...p, verified: v.id }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filters.verified === v.id
                        ? "bg-[#A78BFA]/20 border-[#A78BFA]/50 text-[#C4B5FD]"
                        : "bg-white/4 border-white/10 text-[#94A3B8] hover:border-white/20 hover:text-white"}`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Author Wallet */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Author Wallet Address</label>
                <input type="text" placeholder="0x..." value={filters.authorWallet}
                  onChange={(e) => setFilters((p) => ({ ...p, authorWallet: e.target.value }))}
                  className="w-full bg-[#0A0A1E]/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#CBD5E1] placeholder:text-[#475569] focus:outline-none focus:border-[#A78BFA]/40 font-mono transition-colors" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-5 pt-4 border-t border-white/5">
              <p className="text-xs text-[#475569]">
                Showing <span className="text-[#A78BFA] font-semibold">{filtered.length}</span> of <span className="text-white">{experiments.length}</span> papers
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters}
                  className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── PAPER CARDS ───────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gradient-to-br from-[#121230]/30 to-[#1E1B4B]/30 rounded-3xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <Filter className="w-12 h-12 text-[#312E81]" />
            <h3 className="text-xl font-bold text-[#94A3B8]">No papers match your filters</h3>
            <p className="text-sm text-[#475569]">Try adjusting or clearing your filters</p>
            <button onClick={clearFilters} className="mt-2 px-5 py-2 rounded-full bg-[#A78BFA]/20 border border-[#A78BFA]/30 text-[#C4B5FD] text-sm font-semibold hover:bg-[#A78BFA]/30 transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filtered.map((exp) => {
              const isBuyer = exp.isUnlocked || isAdmin;
              const expVotes = votes[exp.id] || { ups: 0, downs: 0, userVote: null };
              const expComments = comments[exp.id] || [];
              const expReviews = reviews[exp.id] || [];
              const avg = avgRating(exp.id);
              const tabActive = activeTab[exp.id];
              const hasReviewed = expReviews.some((r) => r.reviewer_wallet?.toLowerCase() === walletAddress?.toLowerCase());
              const draft = reviewDraft[exp.id] || {};

              return (
                <div key={exp.id} className={`group relative bg-gradient-to-br from-[#121230]/50 to-[#1E1B4B]/50 ${glassBase} rounded-3xl overflow-hidden hover:border-[#A78BFA]/30 hover:shadow-[0_0_50px_-10px_rgba(167,139,250,0.3)]`}>

                  {/* Card Header */}
                  <div className="p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex gap-2 mb-3 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4B5FD] bg-gradient-to-r from-[#A78BFA]/10 to-[#2DD4BF]/10 px-3 py-1 rounded-full border border-[#A78BFA]/20">
                            {exp.category || "Physics"}
                          </span>
                          {exp.verified && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF] bg-[#2DD4BF]/10 px-3 py-1 rounded-full border border-[#2DD4BF]/20 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-[#C4B5FD] transition-colors">{exp.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#94A3B8] font-medium">
                          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {exp.author}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {exp.date}</span>
                          <span className="flex items-center gap-1.5 text-[#2DD4BF]"><Shield className="w-3.5 h-3.5" /> Verified on Polygon</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isAdmin && (
                          <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">
                            <Eye className="w-3 h-3" /> Admin View
                          </span>
                        )}
                        <button id={`report-btn-${exp.id}`} onClick={() => openReport(exp.id, exp.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-orange-500/20 bg-orange-500/5 text-orange-400 hover:bg-orange-500/15 hover:border-orange-400/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all">
                          <Flag className="w-3 h-3" /> Report
                        </button>
                      </div>
                    </div>
                    <p className="text-[#CBD5E1] leading-relaxed mt-4 line-clamp-2">{exp.abstract}</p>
                  </div>

                  {/* Findings */}
                  <div className={`p-8 relative overflow-hidden transition-all duration-500 ${isBuyer ? "bg-gradient-to-r from-[#2DD4BF]/5 to-transparent" : "bg-gradient-to-br from-[#121230]/30 to-[#1E1B4B]/30"}`}>
                    {!isBuyer && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A78BFA]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    )}
                    {isBuyer ? (
                      <div className="bg-gradient-to-r from-[#2DD4BF]/10 to-transparent border border-[#2DD4BF]/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2DD4BF] to-[#0D9488]" />
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[#2DD4BF] font-bold text-sm uppercase flex items-center gap-2">
                            <Unlock className="w-4 h-4" />
                            {isAdmin ? "Admin Bypass: Full Analysis" : "Decrypted Findings"}
                          </h4>
                          {!isAdmin && (
                            <button
                              onClick={async () => {
                                if (aiSummaries[exp.id]) { setAiSummaries((p) => { const n = { ...p }; delete n[exp.id]; return n; }); return; }
                                setLoadingSummary((p) => ({ ...p, [exp.id]: true }));
                                try {
                                  const res = await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ findings: exp.findings, title: exp.title }) });
                                  const data = await res.json();
                                  setAiSummaries((p) => ({ ...p, [exp.id]: data.summary }));
                                } catch { setAiSummaries((p) => ({ ...p, [exp.id]: "Failed to generate summary." })); }
                                finally { setLoadingSummary((p) => ({ ...p, [exp.id]: false })); }
                              }}
                              disabled={loadingSummary[exp.id]}
                              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-[#A78BFA]/20 to-[#2DD4BF]/20 border border-[#A78BFA]/30 text-[#C4B5FD] hover:border-[#A78BFA] transition-all disabled:opacity-50"
                            >
                              {loadingSummary[exp.id] ? <><div className="w-3 h-3 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" /> Generating...</> : aiSummaries[exp.id] ? <>✨ Hide Summary</> : <>✨ AI Summary</>}
                            </button>
                          )}
                        </div>
                        <p className="text-white/90 font-mono text-sm whitespace-pre-wrap leading-relaxed">{exp.findings}</p>
                        {aiSummaries[exp.id] && (
                          <div className="mt-6 bg-gradient-to-br from-[#A78BFA]/10 to-[#7C3AED]/10 border border-[#A78BFA]/20 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#2DD4BF]" />
                            <h5 className="text-[#C4B5FD] font-bold text-xs uppercase tracking-widest mb-4">✨ AI-Generated Summary</h5>
                            <div className="text-white/90 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: aiSummaries[exp.id].replace(/## (.*)/g, '<h3 class="text-[#C4B5FD] font-bold text-sm mt-4 mb-2">$1</h3>').replace(/- (.*)/g, '<li class="ml-4 text-white/80">$1</li>').replace(/\n/g, "<br/>") }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative bg-gradient-to-br from-[#121230]/40 to-[#1E1B4B]/40 border border-white/5 rounded-2xl p-8 text-center z-10 backdrop-blur-sm">
                        <div className="filter blur-sm opacity-20 select-none mb-6 font-mono text-xs text-[#94A3B8] leading-loose">
                          [ENCRYPTED BLOCK 0x4f...a2] <br /> CRITICAL FAILURE DETECTED IN SECTOR 7... <br /> DATA HASH: a92...b1...e4...
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="bg-gradient-to-br from-[#121230] to-[#1E1B4B] p-3 rounded-full mb-3 border border-[#A78BFA]/20 shadow-lg">
                            <Lock className="w-6 h-6 text-[#C4B5FD]" />
                          </div>
                          <p className="text-[#CBD5E1] text-sm font-bold mb-6">Encrypted on Blockchain</p>
                          <button onClick={() => unlockPaper(exp)}
                            className="flex items-center gap-3 bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white px-8 py-3.5 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(167,139,250,0.4)]">
                            Unlock for {exp.price || "0.0001"} ETH
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── ENGAGEMENT BAR ─────────────────────────────── */}
                  <div className="px-8 py-4 border-t border-white/5 bg-gradient-to-r from-white/[0.01] to-transparent">
                    {isBuyer ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Votes */}
                        <div className="flex items-center gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
                          <button
                            onClick={() => submitVote(exp.id, "up")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${expVotes.userVote === "up" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-[#94A3B8] hover:bg-white/8 hover:text-emerald-400"}`}>
                            <ThumbsUp className="w-4 h-4" /> {expVotes.ups}
                          </button>
                          <div className="w-px h-5 bg-white/10" />
                          <button
                            onClick={() => submitVote(exp.id, "down")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${expVotes.userVote === "down" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-[#94A3B8] hover:bg-white/8 hover:text-red-400"}`}>
                            <ThumbsDown className="w-4 h-4" /> {expVotes.downs}
                          </button>
                        </div>

                        <div className="flex-1" />

                        {/* Discussion tab btn */}
                        <button
                          onClick={() => toggleTab(exp.id, "discussion")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${tabActive === "discussion" ? "bg-[#A78BFA]/20 border-[#A78BFA]/40 text-[#C4B5FD]" : "bg-white/4 border-white/8 text-[#94A3B8] hover:border-white/15 hover:text-white"}`}>
                          <MessageCircle className="w-4 h-4" />
                          Discussion
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${tabActive === "discussion" ? "bg-[#A78BFA]/30 text-[#C4B5FD]" : "bg-white/8 text-[#475569]"}`}>
                            {expComments.length}
                          </span>
                        </button>

                        {/* Reviews tab btn */}
                        <button
                          onClick={() => toggleTab(exp.id, "reviews")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${tabActive === "reviews" ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-300" : "bg-white/4 border-white/8 text-[#94A3B8] hover:border-white/15 hover:text-white"}`}>
                          <Star className="w-4 h-4" />
                          Reviews
                          {avg ? (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                              {expReviews.length} · {avg}★
                            </span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/8 text-[#475569]">{expReviews.length}</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-[#475569] py-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock this paper to vote, discuss, and leave reviews</span>
                      </div>
                    )}
                  </div>

                  {/* ── DISCUSSION PANEL ─────────────────────────────── */}
                  {tabActive === "discussion" && isBuyer && (
                    <div className="px-8 pb-8 border-t border-[#A78BFA]/10 bg-[#A78BFA]/[0.02]">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-[#C4B5FD] uppercase tracking-widest pt-6 mb-4">
                        <MessageCircle className="w-4 h-4" /> Discussion
                      </h4>

                      {loadingTab[`${exp.id}_d`] ? (
                        <div className="flex items-center gap-2 text-sm text-[#475569] py-4">
                          <div className="w-4 h-4 border-2 border-[#A78BFA]/30 border-t-[#A78BFA] rounded-full animate-spin" />
                          Loading comments...
                        </div>
                      ) : expComments.length === 0 ? (
                        <div className="text-center py-6 text-[#475569] text-sm">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          No comments yet. Be the first to share your thoughts!
                        </div>
                      ) : (
                        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                          {buildCommentTree(expComments).map((c) => renderComment(c, exp.id))}
                        </div>
                      )}

                      {/* New comment input */}
                      <div className="mt-5 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#2DD4BF] flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-1">
                          {walletAddress?.slice(2, 4).toUpperCase() || "??"}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <textarea
                            rows={2}
                            value={commentInput[exp.id] || ""}
                            onChange={(e) => setCommentInput((p) => ({ ...p, [exp.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(exp.id, commentInput[exp.id]); } }}
                            placeholder="Share your thoughts on this research... (Enter to send)"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#CBD5E1] placeholder:text-[#475569] focus:outline-none focus:border-[#A78BFA]/40 resize-none transition-colors"
                          />
                          <button
                            onClick={() => submitComment(exp.id, commentInput[exp.id])}
                            disabled={!commentInput[exp.id]?.trim() || submittingComment[exp.id]}
                            className="self-end px-4 py-3 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                            {submittingComment[exp.id] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── REVIEWS PANEL ─────────────────────────────────── */}
                  {tabActive === "reviews" && isBuyer && (
                    <div className="px-8 pb-8 border-t border-yellow-500/10 bg-yellow-500/[0.02]">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-yellow-300 uppercase tracking-widest pt-6 mb-4">
                        <Star className="w-4 h-4" /> Reviews
                        {avg && <span className="text-yellow-400 font-black">{avg}★</span>}
                      </h4>

                      {loadingTab[`${exp.id}_r`] ? (
                        <div className="flex items-center gap-2 text-sm text-[#475569] py-4">
                          <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
                          Loading reviews...
                        </div>
                      ) : (
                        <>
                          {/* Existing reviews */}
                          {expReviews.length > 0 && (
                            <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
                              {expReviews.map((rev) => (
                                <div key={rev.id} className="bg-white/[0.03] border border-white/8 rounded-xl p-5">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-[9px] font-bold text-white">
                                        {rev.reviewer_wallet?.slice(2, 4).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="text-xs font-mono text-[#A78BFA]">{rev.reviewer_wallet?.slice(0, 6)}...{rev.reviewer_wallet?.slice(-4)}</span>
                                        <span className="text-[10px] text-[#475569] ml-2">{new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                      </div>
                                    </div>
                                    <StarRating value={rev.overall_rating} readonly size="sm" />
                                  </div>
                                  <div className="flex gap-4 mb-3 text-xs text-[#94A3B8]">
                                    {rev.methodology_rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[#475569]">Methodology:</span>
                                        <StarRating value={rev.methodology_rating} readonly size="sm" />
                                      </div>
                                    )}
                                    {rev.data_quality_rating > 0 && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-[#475569]">Data Quality:</span>
                                        <StarRating value={rev.data_quality_rating} readonly size="sm" />
                                      </div>
                                    )}
                                  </div>
                                  {rev.review_text && <p className="text-sm text-[#CBD5E1] leading-relaxed">{rev.review_text}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {expReviews.length === 0 && !hasReviewed && (
                            <div className="text-center py-4 text-[#475569] text-sm mb-6">
                              <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              No reviews yet. Share your assessment!
                            </div>
                          )}

                          {/* Write a review form */}
                          {!hasReviewed && walletAddress ? (
                            <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/15 rounded-2xl p-6">
                              <h5 className="text-sm font-bold text-yellow-300 mb-4">Write a Review</h5>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2 block">Overall <span className="text-yellow-400">*</span></label>
                                    <StarRating value={draft.overall || 0} onChange={(v) => setReviewDraft((p) => ({ ...p, [exp.id]: { ...p[exp.id], overall: v } }))} />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2 block">Methodology</label>
                                    <StarRating value={draft.methodology || 0} onChange={(v) => setReviewDraft((p) => ({ ...p, [exp.id]: { ...p[exp.id], methodology: v } }))} />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2 block">Data Quality</label>
                                    <StarRating value={draft.dataQuality || 0} onChange={(v) => setReviewDraft((p) => ({ ...p, [exp.id]: { ...p[exp.id], dataQuality: v } }))} />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2 block">Your Review <span className="text-[#475569] font-normal normal-case">(optional)</span></label>
                                  <textarea rows={3}
                                    value={draft.text || ""}
                                    onChange={(e) => setReviewDraft((p) => ({ ...p, [exp.id]: { ...p[exp.id], text: e.target.value } }))}
                                    placeholder="Describe your assessment of this research..."
                                    className="w-full bg-[#0A0A1E]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#CBD5E1] placeholder:text-[#475569] focus:outline-none focus:border-yellow-500/30 resize-none transition-colors"
                                  />
                                </div>
                                <button
                                  onClick={() => submitReview(exp.id)}
                                  disabled={!draft.overall || submittingReview[exp.id]}
                                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                  {submittingReview[exp.id] ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <><Star className="w-4 h-4 fill-white" /> Submit Review</>}
                                </button>
                              </div>
                            </div>
                          ) : hasReviewed ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                              <CheckCircle2 className="w-4 h-4" /> You've already reviewed this paper.
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── REPORT MODAL ─────────────────────────────────────────────── */}
      {reportModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeReport(); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0F0F2A] to-[#1A1A3E] border border-orange-500/20 rounded-3xl shadow-[0_0_80px_-10px_rgba(249,115,22,0.35)] overflow-hidden">
            <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400" />
            <div className="p-8">
              {reportSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Report Submitted</h3>
                  <p className="text-sm text-[#94A3B8] max-w-xs">Thank you for helping keep DataCrypt accurate. Our team will review this paper shortly.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Report Paper</h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-[280px]">{reportModal.expTitle}</p>
                      </div>
                    </div>
                    <button onClick={closeReport} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Select a reason <span className="text-orange-400">*</span></p>
                  <div className="grid grid-cols-1 gap-2 mb-5">
                    {REPORT_REASONS.map((r) => (
                      <button key={r.id} onClick={() => setReportReason(r.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${reportReason === r.id ? "border-orange-400/60 bg-orange-500/15 text-orange-200" : "border-white/8 bg-white/[0.04] text-[#CBD5E1] hover:border-white/15 hover:bg-white/[0.08]"}`}>
                        <span className="text-base">{r.icon}</span>
                        <span>{r.label}</span>
                        {reportReason === r.id && <div className="ml-auto w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Additional Details <span className="text-[#475569] normal-case font-normal">(optional)</span></p>
                  <textarea rows={3} value={reportDetails} onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe the specific issue..."
                    className="w-full bg-[#0A0A1E]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#CBD5E1] placeholder:text-[#475569] focus:outline-none focus:border-orange-500/40 resize-none transition-all mb-6" />
                  <div className="flex gap-3">
                    <button onClick={closeReport} className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all text-sm font-semibold">Cancel</button>
                    <button onClick={submitReport} disabled={!reportReason || reportSubmitting}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {reportSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <><Flag className="w-4 h-4" /> Submit Report</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className={`relative z-20 pt-20 pb-10 bg-gradient-to-b from-transparent via-[#0A0A1E]/50 to-[#0A0A1E] ${glassBase} border-t border-white/5`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0A0A1E] via-transparent to-transparent -z-10 pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 ${primaryGradient} rounded-lg flex items-center justify-center shadow-lg shadow-[#A78BFA]/20`}>
                  <Beaker className="text-white w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] bg-clip-text text-transparent">DataCrypt</span>
                  <span className="text-xs text-[#94A3B8]">Cosmic Knowledge Archive</span>
                </div>
              </div>
              <p className="text-[#CBD5E1] max-w-sm mb-8 leading-relaxed bg-[#121230]/30 p-4 rounded-xl border border-white/5">
                The decentralized archive for negative results. We transform scientific failure into valuable knowledge assets, accelerating discovery across all domains.
              </p>
              <div className="flex gap-4">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#121230] to-[#1E1B4B] border border-[#312E81] flex items-center justify-center text-[#94A3B8] hover:bg-gradient-to-r hover:from-[#A78BFA] hover:to-[#7C3AED] hover:text-white hover:border-[#A78BFA] transition-all cursor-pointer">
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2"><Globe className="w-4 h-4 text-[#2DD4BF]" /> Platform</h4>
              <ul className="space-y-4 text-sm text-[#CBD5E1]">
                {["Search Archive", "Publish Research", "API Access"].map((item, i) => (
                  <li key={i} className="hover:text-[#C4B5FD] cursor-pointer transition-colors flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${i === 0 ? "bg-[#A78BFA]" : i === 1 ? "bg-[#7C3AED]" : "bg-[#2DD4BF]"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2"><Moon className="w-4 h-4 text-[#C4B5FD]" /> Contact</h4>
              <ul className="space-y-4 text-sm text-[#CBD5E1]">
                <li className="flex items-center gap-2 hover:text-[#C4B5FD] transition-colors"><Mail className="w-4 h-4 text-[#A78BFA]" /> momomiamyself@gmail.com</li>
                <li className="flex items-center gap-2 hover:text-[#C4B5FD] transition-colors"><MapPin className="w-4 h-4 text-[#2DD4BF]" /> Kolkata, India</li>
                <li className="mt-4 p-3 bg-gradient-to-r from-[#121230]/50 to-[#1E1B4B]/50 rounded-xl border border-[#312E81] text-xs flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                  <span className="text-[#CBD5E1] font-medium">All Systems Operational</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#94A3B8]">
            <p className="flex items-center gap-2">
              <span>© 2025 DataCrypt Decentralized Science</span>
              <span className="w-1 h-1 rounded-full bg-[#4C1D95]" />
              <span>All rights reserved</span>
            </p>
            <div className="flex gap-6">
              <span className="hover:text-[#C4B5FD] cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-[#C4B5FD] cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        ::selection { background: rgba(167, 139, 250, 0.4); color: white; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #312E81; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #A78BFA; }
      `}</style>
    </div>
  );
}
