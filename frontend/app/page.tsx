// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { supabase } from "./lib/supabaseClient";
import {
  Search, Lock, Unlock, Beaker, Zap, FileText, User, Calendar,
  Shield, Wallet, Eye, ArrowRight, TrendingUp, Activity, Globe,
  Twitter, Github, Linkedin, Mail, MapPin, Database, Server,
  Star, Cloud, Target, Moon
} from "lucide-react";

// --- CONFIGURATION ---
const ADMIN_ADDRESS = "0x09aa54130858C1B6d82243FC12536A684221DC46";

// --- LAVENDER SERENITY COLOR PALETTE ---
const primaryGradient = "bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#2DD4BF]";
const textGradient = "text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#C4B5FD] to-[#2DD4BF]";
const subtleGlow = "shadow-[0_0_30px_rgba(167,139,250,0.15)]";
const intenseGlow = "shadow-[0_0_50px_rgba(167,139,250,0.25)]";
const glassBase = "backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 transition-all duration-300";

// --- ANIMATED MARQUEE COMPONENT ---
const MarqueeColumn = ({ children, duration = "60s", reverse = false }) => (
  <div className="relative flex flex-col overflow-visible h-[140vh] -my-40">
    <div
      className={`flex flex-col gap-8 animate-scroll ${reverse ? 'flex-col-reverse' : ''}`}
      style={{ animationDuration: duration }}
    >
      {children}
      {children}
      {children} {/* Triple the content for seamless loop */}
    </div>
    <style jsx>{`
      @keyframes scroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(-66.666%); } /* Adjusted for triple content */
      }
      .animate-scroll {
        animation: scroll linear infinite;
        will-change: transform;
      }
    `}</style>
  </div>
);

// --- ANIMATED COUNTER COMPONENT ---
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < duration) {
        const nextCount = Math.min(end, Math.floor((progress / duration) * end));
        setCount(nextCount);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}</span>;
};

// --- PAPER CARD ---
const PaperCard = ({ title, abstract, date, id, category }) => (
  <div className="w-64 flex-shrink-0 bg-gradient-to-br from-[#121230] to-[#1E1B4B] backdrop-blur-xl rounded-xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] border border-[#A78BFA]/20 text-white transform transition-all hover:scale-105 duration-500 hover:shadow-[0_0_40px_rgba(167,139,250,0.4)] group cursor-default hover:border-[#2DD4BF]/30 overflow-visible">
    <div className="flex justify-between items-center mb-3 border-b border-[#312E81]/30 pb-2">
      <span className="text-[9px] font-bold uppercase tracking-widest text-[#C4B5FD]">Ref #{id}</span>
      <span className="text-[9px] font-mono text-[#94A3B8]">{date}</span>
    </div>
    <div className="h-1 w-8 bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] mb-3 rounded-full opacity-80"></div>
    <h3 className="font-sans text-lg font-bold leading-tight mb-3 text-white line-clamp-2 min-h-[3.5rem]">{title}</h3>
    <p className="font-sans text-[10px] leading-relaxed text-[#CBD5E1] text-justify line-clamp-4 min-h-[4.8rem]">{abstract}</p>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-full bg-[#A78BFA]/30 border border-[#A78BFA]/50 shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-[#7C3AED]/30 -ml-1.5 border border-[#7C3AED]/50 shadow-sm"></div>
      </div>
      <div className="text-[8px] font-black tracking-wider text-[#2DD4BF] border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2 py-0.5 rounded-full">{category || "ENCRYPTED"}</div>
    </div>
  </div>
);

// --- REFINED STAT CARD (Vertical Layout) ---
const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colors = {
    lavender: "text-[#A78BFA] border-[#A78BFA]/30 bg-[#A78BFA]/10",
    violet: "text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10",
    teal: "text-[#2DD4BF] border-[#2DD4BF]/30 bg-[#2DD4BF]/10",
  };
  const activeStyle = colors[color] || colors.lavender;

  return (
    <div className="relative group h-full w-full">
      {/* Background Glow */}
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-transparent via-[#A78BFA]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 blur-sm`}></div>

      {/* Card Content */}
      <div className={`relative bg-gradient-to-br from-[#121230]/60 to-[#1E1B4B]/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-start gap-4 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl h-36 justify-between`}>

        {/* Header Row: Icon + Live Badge (Side by Side) */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${activeStyle}`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* LIVE BADGE - Moved here beside the icon */}
          {subtext && (
            <div className="flex items-center gap-1.5 bg-[#2DD4BF]/10 border border-[#2DD4BF]/40 px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.3)] animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]"></span>
              </span>
              <span className="text-[9px] font-bold text-[#2DD4BF] uppercase tracking-wider leading-none pt-[1px]">{subtext}</span>
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">{label}</p>

          {/* Value */}
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-black text-white leading-none drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]">
              {typeof value === 'number' ? <AnimatedCounter end={value} /> : value}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [experiments, setExperiments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // AI Summary state
  const [aiSummaries, setAiSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState({});

  const categories = ["All", "Physics", "Chemistry", "Biology", "AI/ML", "Engineering", "Medicine"];

  // EXTENDED DUMMY DATA FOR SEAMLESS CAROUSEL (30+ papers total)
  const dummyData1 = [
    { id: 801, title: "Anomalies in Quantum Hall Effect at 4K", abstract: "Observed unexpected resistance plateaus that deviate from standard topological insulator models.", date: "Oct 2025", category: "Physics" },
    { id: 802, title: "Failed Synthesis of Carbon Nanoribbons", abstract: "Chemical vapor deposition resulted in amorphous carbon clusters rather than structured ribbons.", date: "Sept 2025", category: "Chemistry" },
    { id: 803, title: "CRISPR-Cas9 Off-Target Mutations", abstract: "High frequency of indel mutations found in non-target loci of the murine genome.", date: "Nov 2025", category: "Biology" },
    { id: 804, title: "Superconductivity Failure in Cuprates", abstract: "Expected superconducting transition absent despite optimal doping levels and temperature conditions.", date: "Aug 2025", category: "Physics" },
    { id: 805, title: "Protein Folding Algorithm Divergence", abstract: "Deep learning model consistently produced unrealistic tertiary structures across diverse protein families.", date: "July 2025", category: "AI/ML" },
    { id: 806, title: "Catalyst Deactivation in Methanol Synthesis", abstract: "Rapid loss of catalytic activity observed within first 24 hours of operation.", date: "Dec 2025", category: "Chemistry" },
    { id: 807, title: "Neural Interface Signal Degradation", abstract: "Implantable electrodes showed 60% signal loss after 30 days in primate trials.", date: "Jan 2026", category: "Medicine" },
    { id: 808, title: "Quantum Gate Decoherence Times", abstract: "Measured coherence times 50% below theoretical predictions across multiple qubit architectures.", date: "Mar 2025", category: "Physics" },
    { id: 809, title: "Enzyme Thermostability Limits", abstract: "Engineered enzymes denatured at temperatures 15°C below computational predictions.", date: "Feb 2025", category: "Biology" },
    { id: 810, title: "GAN Training Mode Collapse", abstract: "Generator converged to single output mode despite extensive hyperparameter optimization.", date: "Apr 2025", category: "AI/ML" },
  ];

  const dummyData2 = [
    { id: 901, title: "Neural Net Mode Collapse in GANs", abstract: "Generator network consistently converged to a single output despite hyperparameter tuning.", date: "Aug 2025", category: "AI/ML" },
    { id: 902, title: "Perovskite Solar Cell Instability", abstract: "Rapid degradation of efficiency observed under high humidity conditions within 24 hours.", date: "July 2025", category: "Engineering" },
    { id: 903, title: "Superconductor Phase Transition Failure", abstract: "Material remained insulative despite theoretical predictions of superconductivity at high pressure.", date: "Oct 2025", category: "Physics" },
    { id: 904, title: "Antibiotic Resistance Mechanism", abstract: "Novel compound showed no bactericidal effect against multi-drug resistant strains.", date: "June 2025", category: "Medicine" },
    { id: 905, title: "Battery Cycle Life Degradation", abstract: "Solid-state batteries lost 40% capacity after 200 cycles instead of projected 1000.", date: "May 2025", category: "Engineering" },
    { id: 906, title: "Gene Drive Population Dynamics", abstract: "Unexpectedly rapid resistance evolution observed in mosquito populations.", date: "Sept 2025", category: "Biology" },
    { id: 907, title: "Reinforcement Learning Reward Hacking", abstract: "Agent discovered unintended loopholes to maximize reward without solving actual task.", date: "Nov 2025", category: "AI/ML" },
    { id: 908, title: "Carbon Capture Adsorbent Regeneration", abstract: "Material failed to regenerate completely after 5 cycles despite theoretical reversibility.", date: "Aug 2025", category: "Chemistry" },
    { id: 909, title: "Tissue Engineering Scaffold Rejection", abstract: "Biocompatible polymer triggered unexpected immune response in mammalian models.", date: "Oct 2025", category: "Medicine" },
    { id: 910, title: "Optical Computing Gate Crosstalk", abstract: "Photon leakage between adjacent gates exceeded acceptable thresholds by 300%.", date: "Dec 2025", category: "Engineering" },
  ];

  const dummyData3 = [
    { id: 1001, title: "Topological Insulator Surface States", abstract: "Predicted conducting surface states were not observed in ARPES measurements.", date: "Jan 2026", category: "Physics" },
    { id: 1002, title: "Enzyme Cascade Optimization Failure", abstract: "Multi-enzyme system showed inhibitory cross-talk rather than synergistic enhancement.", date: "Feb 2026", category: "Biology" },
    { id: 1003, title: "Transformer Model Overfitting", abstract: "Attention mechanism memorized training data rather than learning generalized patterns.", date: "Mar 2026", category: "AI/ML" },
    { id: 1004, title: "Hydrogen Storage Material Kinetics", abstract: "Absorption/desorption rates 100x slower than predicted by DFT calculations.", date: "Apr 2026", category: "Chemistry" },
    { id: 1005, title: "CRISPR Base Editing Efficiency", abstract: "Single-base editing showed <5% efficiency in human stem cells.", date: "May 2026", category: "Biology" },
    { id: 1006, title: "Quantum Error Correction Threshold", abstract: "Error rates remained above fault-tolerance threshold despite improved encoding.", date: "June 2026", category: "Physics" },
    { id: 1007, title: "Drug Delivery Nanoparticle Clearance", abstract: "Targeted nanoparticles accumulated in liver rather than tumor sites.", date: "July 2026", category: "Medicine" },
    { id: 1008, title: "Self-Healing Polymer Limitations", abstract: "Healing efficiency dropped below 30% after third damage-repair cycle.", date: "Aug 2026", category: "Engineering" },
    { id: 1009, title: "Metamaterial Negative Refraction", abstract: "Fabricated structures showed positive refraction index across tested frequencies.", date: "Sept 2026", category: "Physics" },
    { id: 1010, title: "Microbiome Transplantation Stability", abstract: "Donor microbiome failed to establish persistent colonization in recipient.", date: "Oct 2026", category: "Biology" },
  ];

  useEffect(() => {
    checkWallet();
    loadExperiments();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          checkAdminStatus(accounts[0]);
        } else {
          setWalletAddress("");
          setIsAdmin(false);
        }
      });
    }
  }, []);

  const checkAdminStatus = (address) => {
    if (address && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) setIsAdmin(true);
    else setIsAdmin(false);
  };

  const checkWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          checkAdminStatus(accounts[0]);
        }
      } catch (err) { console.error(err); }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
    checkAdminStatus(accounts[0]);
  };

  const loadExperiments = async () => {
    setIsLoading(true);
    const { data: papers, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Supabase error:", error);

    const myUnlocks = JSON.parse(localStorage.getItem("myUnlockedIds") || "[]");

    if (papers) {
      const merged = papers.map(p => ({
        ...p,
        isUnlocked: myUnlocks.includes(p.id)
      }));
      setExperiments(merged);
    }
    setIsLoading(false);
  };

  const unlockPaper = async (experiment) => {
    if (!window.ethereum) return alert("Install Metamask");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const recipient = experiment.wallet_address || ADMIN_ADDRESS;

      // Fetch fee data to handle gas pricing explicitly for Polygon Amoy
      const feeData = await provider.getFeeData();
      console.log("Current Fee Data:", feeData);

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther("0.0001"),
        // Explicitly set fees with a high floor to handle Polygon Amoy's minimum requirements
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
      const newUnlocks = [...myUnlocks, experiment.id];
      localStorage.setItem("myUnlockedIds", JSON.stringify(newUnlocks));

      const updated = experiments.map(exp =>
        exp.id === experiment.id ? { ...exp, isUnlocked: true } : exp
      );
      setExperiments(updated);

    } catch (error) {
      console.error(error);
      alert("Payment Error: " + error.message);
    }
  };

  const filtered = experiments.filter(exp =>
    (activeCategory === "All" || (exp.category || "Physics") === activeCategory) &&
    (exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.abstract.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1E] via-[#0F0F2A] to-[#0A0A1E] text-gray-100 font-sans overflow-x-hidden relative">

      {/* --- DARK COSMIC BACKGROUND (Static Layers Only) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050514]">

        {/* --- PROBLEM FIXED: REMOVED RANDOM STARFIELD LOOP HERE --- */}

        {/* Dark Nebula Layers (These are safe/static) */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Deep Purple Nebula */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-30"
            style={{
              background: 'radial-gradient(circle, #4C1D95 0%, transparent 70%)',
              top: '10%',
              left: '5%',
              animation: 'float-slow 25s infinite ease-in-out'
            }}
          />

          {/* Teal Nebula */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-25"
            style={{
              background: 'radial-gradient(circle, #0D9488 0%, transparent 70%)',
              bottom: '15%',
              right: '10%',
              animation: 'float-slow 20s infinite ease-in-out reverse'
            }}
          />

          {/* Dark Blue Cloud */}
          <div
            className="absolute w-[1000px] h-[1000px] rounded-full blur-[120px] opacity-10"
            style={{
              background: 'radial-gradient(circle, #1E1B4B 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #A78BFA 1px, transparent 1px),
                              linear-gradient(to bottom, #A78BFA 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed w-full bg-gradient-to-b from-[#0A0A1E]/95 via-[#0A0A1E]/90 to-transparent z-50 transition-all duration-300 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${subtleGlow} bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] group-hover:scale-105 transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(167,139,250,0.4)]`}>
              <Beaker className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] bg-clip-text text-transparent">DataCrypt</span>
              <span className="text-xs text-[#94A3B8] tracking-widest">COSMIC ARCHIVE</span>
            </div>
          </Link>

          <div className="flex gap-4 items-center">
            <Link href="/publish">
              <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#121230] to-[#1E1B4B] border border-[#312E81] text-[#CBD5E1] hover:text-white hover:border-[#A78BFA] hover:shadow-[0_0_25px_rgba(167,139,250,0.4)] transition-all duration-300 group">
                <FileText className="w-4 h-4" /> Publish Research
              </button>
            </Link>
            {walletAddress && (
              <Link href="/profile">
                <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#121230] to-[#1E1B4B] border border-[#312E81] text-[#CBD5E1] hover:text-white hover:border-[#2DD4BF] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] transition-all duration-300 group">
                  <User className="w-4 h-4" /> My Profile
                </button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin">
                <button className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition-all animate-pulse backdrop-blur-sm">
                  <Shield className="w-4 h-4" /> Admin Portal
                </button>
              </Link>
            )}
            {walletAddress ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-default backdrop-blur-md hover:border-[#A78BFA]/30 transition-colors">
                <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                <span className="text-gray-300 text-xs font-mono">{walletAddress.slice(0, 6)}...</span>
              </div>
            ) : (
              <button onClick={connectWallet} className={`flex items-center gap-2 ${primaryGradient} text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-[#A78BFA]/20 backdrop-blur-sm`}>
                <Wallet className="w-4 h-4" /> Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative min-h-[100vh] flex items-center pt-20 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full relative h-full items-center">

          {/* LEFT: Content */}
          <div className="flex flex-col justify-center relative z-20 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 self-start bg-gradient-to-r from-[#A78BFA]/15 to-[#2DD4BF]/10 border border-[#A78BFA]/20 rounded-full px-4 py-1.5 mb-8 mt-12 backdrop-blur-md shadow-[0_0_25px_rgba(167,139,250,0.15)] hover:border-[#2DD4BF]/30 transition-colors cursor-default">
              <Star className="w-3 h-3 text-[#C4B5FD]" />
              <span className="text-xs font-bold text-[#C4B5FD] uppercase tracking-widest">Decentralized Science</span>
            </div>

            {/* --- FONT SIZE SMALLER --- */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[1.1] text-white">
              Research that <br />
              <span className={textGradient}>Transcends Failure</span>
            </h1>

            <p className="text-lg text-[#CBD5E1] mb-10 leading-relaxed max-w-lg border-l-2 border-[#A78BFA]/50 pl-6 backdrop-blur-sm bg-[#121230]/30 p-4 rounded-xl">
              The world's first decentralized archive for negative results. Turn scientific dead-ends into valuable knowledge assets.
            </p>

            {/* SEARCH WITH GLOWING GRADIENT BORDER */}
            <div className="relative group max-w-lg mb-10">
              <div className={`absolute -inset-1 ${primaryGradient} rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-1000`}></div>
              <div className={`relative p-[1px] rounded-xl ${primaryGradient}`}>
                <div className="relative flex items-center bg-gradient-to-br from-[#121230]/80 to-[#1E1B4B]/60 rounded-xl p-1">
                  <Search className="w-5 h-5 text-[#94A3B8] ml-4" />
                  <input
                    type="text"
                    placeholder="Search experiments, domains, or authors..."
                    className="w-full bg-transparent p-4 text-white placeholder-[#94A3B8] focus:outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <button className="bg-gradient-to-r from-[#A78BFA]/20 to-[#2DD4BF]/20 hover:from-[#A78BFA]/30 hover:to-[#2DD4BF]/30 text-white p-2.5 rounded-lg transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* --- DYNAMIC STATS SECTION --- */}
            {/* Aligned with search bar width (max-w-lg) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg w-full">
              <StatCard
                icon={Database}
                label="Experiments"
                value={experiments.length > 0 ? experiments.length : 124}
                color="lavender"
              />
              <StatCard
                icon={Server}
                label="Network Nodes"
                value={843}
                color="violet"
              />
              <StatCard
                icon={Activity}
                label="Live Status"
                value="Online"
                subtext="Live"
                color="teal"
              />
            </div>
          </div>

          {/* RIGHT: Carousel (NOW WITH CONTINUOUS FLOW) */}
          <div className="relative h-[80vh] flex justify-center items-center perspective-1000 z-10 order-1 lg:order-2 overflow-visible">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[180%] flex gap-6 rotate-[8deg] scale-90 lg:scale-100 pointer-events-none opacity-90 overflow-visible">
              {/* Column 1: Physics/Chemistry Focus */}
              <div className="relative flex flex-col overflow-visible">
                <MarqueeColumn duration="70s">
                  {dummyData1.map((p, i) => <PaperCard key={`col1-${i}`} {...p} />)}
                </MarqueeColumn>
              </div>

              {/* Column 2: AI/Biology Focus */}
              <div className="relative flex flex-col overflow-visible mt-20">
                <MarqueeColumn duration="55s" reverse={true}>
                  {dummyData2.map((p, i) => <PaperCard key={`col2-${i}`} {...p} />)}
                </MarqueeColumn>
              </div>

              {/* Column 3: Engineering/Medicine Focus */}
              <div className="relative flex flex-col overflow-visible">
                <MarqueeColumn duration="65s">
                  {dummyData3.map((p, i) => <PaperCard key={`col3-${i}`} {...p} />)}
                </MarqueeColumn>
              </div>
            </div>

            {/* --- GRADIENT OVERLAYS REMOVED --- */}
          </div>
        </div>
      </div>

      {/* --- DATABASE RESULTS --- */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-20">

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 pb-8 border-b border-white/5">
          <div>
            <h2 className="text-4xl font-bold flex items-center gap-3 mb-2 text-white">
              <Target className="text-[#2DD4BF] w-8 h-8 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
              <span className={textGradient}>Recent Archives</span>
            </h2>
            <p className="text-[#CBD5E1]">Discover the latest verified scientific contributions.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = cat === "All" ? experiments.length : experiments.filter(e => (e.category || "Physics") === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-sm ${activeCategory === cat
                    ? `${primaryGradient} border-transparent text-white shadow-lg shadow-[#A78BFA]/20`
                    : "bg-gradient-to-r from-[#121230]/60 to-[#1E1B4B]/60 border-[#312E81]/30 text-[#94A3B8] hover:bg-gradient-to-r hover:from-[#A78BFA]/10 hover:to-[#2DD4BF]/10 hover:border-[#A78BFA]/30 hover:text-white"
                    }`}
                >
                  {cat} <span className="ml-1 opacity-60">({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gradient-to-br from-[#121230]/30 to-[#1E1B4B]/30 rounded-3xl animate-pulse border border-white/5 backdrop-blur-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filtered.map((exp) => (
              <div key={exp.id} className={`group relative bg-gradient-to-br from-[#121230]/50 to-[#1E1B4B]/50 ${glassBase} rounded-3xl overflow-hidden hover:border-[#A78BFA]/30 hover:shadow-[0_0_50px_-10px_rgba(167,139,250,0.3)]`}>
                {/* Card Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4B5FD] bg-gradient-to-r from-[#A78BFA]/10 to-[#2DD4BF]/10 px-3 py-1 rounded-full border border-[#A78BFA]/20">{exp.category || "Physics"}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#C4B5FD] transition-colors drop-shadow-[0_0_10px_rgba(167,139,250,0.2)]">{exp.title}</h3>
                      <div className="flex gap-6 mt-3 text-xs text-[#94A3B8] font-medium">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {exp.author}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {exp.date}</span>
                        <span className="flex items-center gap-1.5 text-[#2DD4BF]"><Shield className="w-3.5 h-3.5" /> Verified on Polygon</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-inner backdrop-blur-sm">
                        <Eye className="w-3 h-3" /> Admin View
                      </span>
                    )}
                  </div>
                  <p className="text-[#CBD5E1] leading-relaxed mt-4 line-clamp-2">{exp.abstract}</p>
                </div>

                {/* Card Body & Unlocking Logic */}
                <div className={`p-8 relative overflow-hidden transition-all duration-500 ${exp.isUnlocked || isAdmin ? "bg-gradient-to-r from-[#2DD4BF]/5 to-transparent" : "bg-gradient-to-br from-[#121230]/30 to-[#1E1B4B]/30"}`}>
                  {!exp.isUnlocked && !isAdmin && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A78BFA]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                  )}

                  {exp.isUnlocked || isAdmin ? (
                    <div className="bg-gradient-to-r from-[#2DD4BF]/10 to-transparent border border-[#2DD4BF]/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2DD4BF] to-[#0D9488] shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[#2DD4BF] font-bold text-sm uppercase flex items-center gap-2">
                          <Unlock className="w-4 h-4" />
                          {isAdmin ? "Admin Bypass: Full Analysis" : "Decrypted Findings"}
                        </h4>
                        {!isAdmin && (
                          <button
                            onClick={async () => {
                              if (aiSummaries[exp.id]) {
                                setAiSummaries(prev => { const n = { ...prev }; delete n[exp.id]; return n; });
                                return;
                              }
                              setLoadingSummary(prev => ({ ...prev, [exp.id]: true }));
                              try {
                                const res = await fetch('/api/summarize', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ findings: exp.findings, title: exp.title })
                                });
                                const data = await res.json();
                                setAiSummaries(prev => ({ ...prev, [exp.id]: data.summary }));
                              } catch (err) {
                                console.error(err);
                                setAiSummaries(prev => ({ ...prev, [exp.id]: 'Failed to generate summary.' }));
                              } finally {
                                setLoadingSummary(prev => ({ ...prev, [exp.id]: false }));
                              }
                            }}
                            disabled={loadingSummary[exp.id]}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-[#A78BFA]/20 to-[#2DD4BF]/20 border border-[#A78BFA]/30 text-[#C4B5FD] hover:border-[#A78BFA] hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] transition-all disabled:opacity-50"
                          >
                            {loadingSummary[exp.id] ? (
                              <><div className="w-3 h-3 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin"></div> Generating...</>
                            ) : aiSummaries[exp.id] ? (
                              <>✨ Hide Summary</>
                            ) : (
                              <>✨ AI Summary</>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-white/90 font-mono text-sm whitespace-pre-wrap leading-relaxed">{exp.findings}</p>

                      {/* AI Summary Card */}
                      {aiSummaries[exp.id] && (
                        <div className="mt-6 bg-gradient-to-br from-[#A78BFA]/10 to-[#7C3AED]/10 border border-[#A78BFA]/20 rounded-xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#2DD4BF]"></div>
                          <h5 className="text-[#C4B5FD] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                            ✨ AI-Generated Summary
                          </h5>
                          <div className="text-white/90 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: aiSummaries[exp.id]
                                .replace(/## (.*)/g, '<h3 class="text-[#C4B5FD] font-bold text-sm mt-4 mb-2">$1</h3>')
                                .replace(/- (.*)/g, '<li class="ml-4 text-white/80">$1</li>')
                                .replace(/\n/g, '<br/>')
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative bg-gradient-to-br from-[#121230]/40 to-[#1E1B4B]/40 border border-white/5 rounded-2xl p-8 text-center z-10 backdrop-blur-sm">
                      <div className="filter blur-sm opacity-20 select-none mb-6 font-mono text-xs text-[#94A3B8] leading-loose">
                        [ENCRYPTED BLOCK 0x4f...a2] <br />
                        CRITICAL FAILURE DETECTED IN SECTOR 7... <br />
                        DATA HASH: a92...b1...e4...
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="bg-gradient-to-br from-[#121230] to-[#1E1B4B] p-3 rounded-full mb-3 backdrop-blur-md border border-[#A78BFA]/20 shadow-lg">
                          <Lock className="w-6 h-6 text-[#C4B5FD]" />
                        </div>
                        <p className="text-[#CBD5E1] text-sm font-bold mb-6">Encrypted on Blockchain</p>
                        <button
                          onClick={() => unlockPaper(exp)}
                          className="flex items-center gap-3 bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white px-8 py-3.5 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(167,139,250,0.4)] hover:shadow-[0_0_50px_rgba(167,139,250,0.6)] group-hover:ring-2 ring-[#C4B5FD]/50"
                        >
                          Unlock for {exp.price || "0.0001"} ETH
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className={`relative z-20 pt-20 pb-10 bg-gradient-to-b from-transparent via-[#0A0A1E]/50 to-[#0A0A1E] ${glassBase} border-t border-white/5`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0A0A1E] via-transparent to-transparent -z-10 pointer-events-none opacity-50"></div>

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
              <p className="text-[#CBD5E1] max-w-sm mb-8 leading-relaxed backdrop-blur-sm bg-[#121230]/30 p-4 rounded-xl border border-white/5">
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
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2DD4BF]" />
                Platform
              </h4>
              <ul className="space-y-4 text-sm text-[#CBD5E1]">
                <li className="hover:text-[#C4B5FD] cursor-pointer transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#A78BFA]"></div>
                  Search Archive
                </li>
                <li className="hover:text-[#C4B5FD] cursor-pointer transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#7C3AED]"></div>
                  Publish Research
                </li>
                <li className="hover:text-[#C4B5FD] cursor-pointer transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#2DD4BF]"></div>
                  API Access
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#C4B5FD]" />
                Contact
              </h4>
              <ul className="space-y-4 text-sm text-[#CBD5E1]">
                <li className="flex items-center gap-2 hover:text-[#C4B5FD] transition-colors">
                  <Mail className="w-4 h-4 text-[#A78BFA]" />
                  momomiamyself@gmail.com
                </li>
                <li className="flex items-center gap-2 hover:text-[#C4B5FD] transition-colors">
                  <MapPin className="w-4 h-4 text-[#2DD4BF]" />
                  Kolkata, India
                </li>
                <li className="mt-4 p-3 bg-gradient-to-r from-[#121230]/50 to-[#1E1B4B]/50 rounded-xl border border-[#312E81] text-xs flex items-center gap-2 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                  <span className="text-[#CBD5E1] font-medium">All Systems Operational</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#94A3B8]">
            <p className="flex items-center gap-2">
              <span>© 2025 DataCrypt Decentralized Science</span>
              <span className="w-1 h-1 rounded-full bg-[#4C1D95]"></span>
              <span>All rights reserved</span>
            </p>
            <div className="flex gap-6">
              <span className="hover:text-[#C4B5FD] cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-[#C4B5FD] cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Add animations to global CSS */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        ::selection {
          background: rgba(167, 139, 250, 0.4);
          color: white;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0A0A1E;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #A78BFA, #7C3AED);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #C4B5FD, #A78BFA);
        }
      `}</style>
    </div>
  );
}
