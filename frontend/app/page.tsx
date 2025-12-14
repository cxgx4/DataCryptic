// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { supabase } from "./lib/supabaseClient";
import { Search, Lock, Unlock, Beaker, Zap, FileText, User, Calendar, Tag, Shield, Wallet, ArrowRight, BarChart3, Globe } from "lucide-react";

const ADMIN_ADDRESS = "0x09aa54130858C1B6d82243FC12536A684221DC46"; 

export default function SearchPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [experiments, setExperiments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Physics", "Chemistry", "Biology", "AI/ML"];

  useEffect(() => {
    checkWallet();
    loadExperiments();
  }, []);

  const checkWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        if (accounts[0].toLowerCase() === ADMIN_ADDRESS.toLowerCase()) setIsAdmin(true);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
    if (accounts[0].toLowerCase() === ADMIN_ADDRESS.toLowerCase()) setIsAdmin(true);
  };

  const loadExperiments = async () => {
    setIsLoading(true);
    // 1. Fetch from Supabase
    const { data: papers, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Supabase error:", error);

    // 2. Check LocalStorage for Unlocks
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
    if(!window.ethereum) return alert("Install Metamask");
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const recipient = experiment.wallet_address || ADMIN_ADDRESS; // Check snake_case

        const tx = await signer.sendTransaction({
            to: recipient,
            value: ethers.parseEther("0.0001")
        });

        alert("Transaction Sent! Waiting for confirmation...");
        await tx.wait();

        // Save Unlock to LocalStorage
        const myUnlocks = JSON.parse(localStorage.getItem("myUnlockedIds") || "[]");
        const newUnlocks = [...myUnlocks, experiment.id];
        localStorage.setItem("myUnlockedIds", JSON.stringify(newUnlocks));

        // Update UI
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
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <Beaker className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">FailVault</span>
            </div>
            <div className="flex gap-4 items-center">
                <Link href="/publish"><button className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"><FileText className="w-4 h-4" /> Upload Paper</button></Link>
                {isAdmin && (<Link href="/admin"><button className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-all"><Shield className="w-4 h-4" /> Admin</button></Link>)}
                {walletAddress ? (
                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-lg"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-indigo-300 text-xs font-mono">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span></div>
                ) : (
                    <button onClick={connectWallet} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-all shadow-lg shadow-white/5"><Wallet className="w-4 h-4" /> Connect Wallet</button>
                )}
            </div>
        </div>
      </nav>

      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">Data that <span className="text-gray-600 line-through decoration-red-500/50 decoration-4">worked</span> <span className="text-indigo-400">failed</span>.</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">Stop repeating mistakes. Access verified negative results and raw data.</p>
            
            <div className="max-w-3xl mx-auto">
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center bg-[#0a0a0a] rounded-xl border border-white/10 shadow-2xl">
                        <Search className="w-6 h-6 text-gray-500 ml-5" />
                        <input type="text" placeholder="Search by keywords..." className="w-full bg-transparent p-5 text-white placeholder-gray-500 focus:outline-none text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map((cat) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>{cat}</button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-8"><Zap className="text-yellow-500 w-5 h-5 fill-yellow-500" /> Recent Failures</h2>
        {isLoading ? <p className="text-center text-gray-500">Loading vault...</p> : (
            <div className="grid grid-cols-1 gap-8">
                {filtered.map((exp) => (
                    <div key={exp.id} className="group bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300">
                        <div className="p-8 border-b border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{exp.title}</h3>
                                    <div className="flex gap-4 mt-2 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {exp.author}</span>
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {exp.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed mt-4">{exp.abstract}</p>
                        </div>

                        <div className={`p-8 ${exp.isUnlocked ? "bg-emerald-950/10" : "bg-black/20"}`}>
                            {exp.isUnlocked ? (
                                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6 relative overflow-hidden">
                                    <h4 className="text-emerald-300 font-bold mb-2 text-sm uppercase flex items-center gap-2"><Unlock className="w-4 h-4"/> Full Analysis</h4>
                                    <p className="text-emerald-100/80 font-mono text-sm whitespace-pre-wrap">{exp.findings}</p>
                                </div>
                            ) : (
                                <div className="relative bg-white/5 border border-white/5 rounded-xl p-6 text-center">
                                    <div className="filter blur-sm opacity-30 select-none mb-4">
                                        The critical failure point occurred regarding thermal runaway...
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Encrypted Data</p>
                                        <button onClick={() => unlockPaper(exp)} className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-all">
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
    </div>
  );
}