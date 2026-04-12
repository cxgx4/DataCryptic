// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { supabase } from "../lib/supabaseClient";
import {
    Beaker, Wallet, ArrowLeft, FileText, Shield, User,
    Calendar, CheckCircle, Clock, TrendingUp, Lock, Unlock,
    Activity, Database, Copy, ExternalLink, Sparkles
} from "lucide-react";

// --- DESIGN TOKENS (matching home page) ---
const textGradient = "text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#C4B5FD] to-[#2DD4BF]";
const primaryGradient = "bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#2DD4BF]";
const glassBase = "backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 transition-all duration-300";

export default function ProfilePage() {
    const [walletAddress, setWalletAddress] = useState("");
    const [papers, setPapers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        totalEarnings: 0,
    });

    useEffect(() => {
        connectAndLoad();
    }, []);

    const connectAndLoad = async () => {
        if (!window.ethereum) {
            setIsLoading(false);
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_accounts", []);
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                await loadPapers(accounts[0]);
            } else {
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) return alert("Install MetaMask or Rabby");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setWalletAddress(accounts[0]);
            await loadPapers(accounts[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const loadPapers = async (address) => {
        setIsLoading(true);
        const lowerAddr = address.toLowerCase();
        const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

        console.log("Loading papers for:", { address, lowerAddr, shortAddr });

        // Try wallet_address first (most reliable, case-insensitive)
        let { data, error } = await supabase
            .from("experiments")
            .select("*")
            .ilike("wallet_address", lowerAddr)
            .order("created_at", { ascending: false });

        // If no results, try matching by the shortened author field
        if ((!data || data.length === 0)) {
            console.log("No results by wallet_address, trying author field...");
            const { data: data2, error: error2 } = await supabase
                .from("experiments")
                .select("*")
                .ilike("author", `%${address.slice(-4)}`)
                .order("created_at", { ascending: false });

            if (data2 && data2.length > 0) {
                data = data2;
            }
        }

        if (data && data.length > 0) {
            console.log("Found papers:", data.length);
            setPapers(data);
            calculateStats(data);
        } else {
            console.log("No papers found for this wallet");
            setPapers([]);
            calculateStats([]);
        }
        setIsLoading(false);
    };

    const calculateStats = (paperList) => {
        const total = paperList.length;
        const verified = paperList.filter((p) => p.verified).length;
        const pending = total - verified;
        const totalEarnings = paperList.reduce((sum, p) => {
            return sum + parseFloat(p.price || "0.0001");
        }, 0);

        setStats({ total, verified, pending, totalEarnings });
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // --- NOT CONNECTED STATE ---
    if (!walletAddress && !isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0A0A1E] via-[#0F0F2A] to-[#0A0A1E] text-gray-100 font-sans flex items-center justify-center relative">
                {/* Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050514]">
                    <div className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-20"
                        style={{ background: 'radial-gradient(circle, #4C1D95 0%, transparent 70%)', top: '10%', left: '5%' }} />
                    <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-15"
                        style={{ background: 'radial-gradient(circle, #0D9488 0%, transparent 70%)', bottom: '15%', right: '10%' }} />
                </div>

                <div className="relative z-10 text-center max-w-md mx-auto p-8">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center shadow-[0_0_60px_rgba(167,139,250,0.3)]">
                        <User className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4">Researcher Profile</h1>
                    <p className="text-[#CBD5E1] mb-8 leading-relaxed">
                        Connect your wallet to view your published research, earnings, and verification status.
                    </p>
                    <button
                        onClick={connectWallet}
                        className={`flex items-center gap-3 mx-auto ${primaryGradient} text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-[#A78BFA]/20`}
                    >
                        <Wallet className="w-5 h-5" /> Connect Wallet
                    </button>
                    <Link href="/" className="block mt-6 text-[#94A3B8] hover:text-[#C4B5FD] transition-colors text-sm">
                        ← Back to Archive
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A1E] via-[#0F0F2A] to-[#0A0A1E] text-gray-100 font-sans overflow-x-hidden relative">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050514]">
                <div className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-20"
                    style={{ background: 'radial-gradient(circle, #4C1D95 0%, transparent 70%)', top: '10%', left: '5%' }} />
                <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-15"
                    style={{ background: 'radial-gradient(circle, #0D9488 0%, transparent 70%)', bottom: '15%', right: '10%' }} />
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(to right, #A78BFA 1px, transparent 1px), linear-gradient(to bottom, #A78BFA 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>
            </div>

            {/* Navbar */}
            <nav className="fixed w-full bg-gradient-to-b from-[#0A0A1E]/95 via-[#0A0A1E]/90 to-transparent z-50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-lg group-hover:scale-105 transition-all">
                            <Beaker className="text-white w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-[#A78BFA] to-[#2DD4BF] bg-clip-text text-transparent">DataCrypt</span>
                            <span className="text-[10px] text-[#94A3B8] tracking-widest">COSMIC ARCHIVE</span>
                        </div>
                    </Link>

                    <div className="flex gap-3 items-center">
                        <Link href="/">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#CBD5E1] hover:text-white hover:border-[#A78BFA]/30 transition-all text-sm">
                                <ArrowLeft className="w-4 h-4" /> Archive
                            </button>
                        </Link>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                            <span className="text-gray-300 text-xs font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">

                {/* Profile Header */}
                <div className={`${glassBase} rounded-3xl p-8 mb-8 relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#2DD4BF]"></div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center shadow-[0_0_40px_rgba(167,139,250,0.3)] shrink-0">
                            <User className="w-10 h-10 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-white mb-2">Researcher Portfolio</h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={copyAddress}
                                    className="flex items-center gap-2 bg-[#121230]/60 border border-white/10 px-4 py-2 rounded-full text-sm text-[#CBD5E1] hover:border-[#A78BFA]/30 transition-all font-mono"
                                >
                                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#2DD4BF]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <span className="flex items-center gap-1.5 text-xs text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 px-3 py-1.5 rounded-full">
                                    <Shield className="w-3 h-3" /> Polygon Amoy
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {/* Total Papers */}
                    <div className={`${glassBase} rounded-2xl p-6 hover:border-[#A78BFA]/30 hover:-translate-y-1 transition-all`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl border bg-[#A78BFA]/10 border-[#A78BFA]/30 text-[#A78BFA]">
                                <Database className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Total Papers</p>
                        </div>
                        <h3 className="text-3xl font-black text-white">{stats.total}</h3>
                    </div>

                    {/* Verified */}
                    <div className={`${glassBase} rounded-2xl p-6 hover:border-[#2DD4BF]/30 hover:-translate-y-1 transition-all`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl border bg-[#2DD4BF]/10 border-[#2DD4BF]/30 text-[#2DD4BF]">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Verified</p>
                        </div>
                        <h3 className="text-3xl font-black text-white">{stats.verified}</h3>
                    </div>

                    {/* Pending */}
                    <div className={`${glassBase} rounded-2xl p-6 hover:border-yellow-500/30 hover:-translate-y-1 transition-all`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl border bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Pending</p>
                        </div>
                        <h3 className="text-3xl font-black text-white">{stats.pending}</h3>
                    </div>

                    {/* Total Earnings */}
                    <div className={`${glassBase} rounded-2xl p-6 hover:border-[#7C3AED]/30 hover:-translate-y-1 transition-all`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl border bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#7C3AED]">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">Listing Value</p>
                        </div>
                        <h3 className="text-3xl font-black text-white">{stats.totalEarnings.toFixed(4)} <span className="text-lg text-[#94A3B8]">ETH</span></h3>
                    </div>
                </div>

                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <FileText className="text-[#2DD4BF] w-6 h-6" />
                        <span className={textGradient}>Your Published Research</span>
                    </h2>
                    <Link href="/publish">
                        <button className={`flex items-center gap-2 ${primaryGradient} text-white px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#A78BFA]/20`}>
                            <Sparkles className="w-4 h-4" /> Publish New
                        </button>
                    </Link>
                </div>

                {/* Papers List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-48 bg-gradient-to-br from-[#121230]/30 to-[#1E1B4B]/30 rounded-3xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : papers.length === 0 ? (
                    <div className={`${glassBase} rounded-3xl p-16 text-center`}>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#121230] border border-white/10 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-[#94A3B8]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Papers Published Yet</h3>
                        <p className="text-[#CBD5E1] mb-8 max-w-md mx-auto">
                            Start contributing to the decentralized science archive by publishing your research findings.
                        </p>
                        <Link href="/publish">
                            <button className={`${primaryGradient} text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-[#A78BFA]/20`}>
                                Publish Your First Paper
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {papers.map((paper) => (
                            <div
                                key={paper.id}
                                className={`group ${glassBase} rounded-3xl overflow-hidden hover:border-[#A78BFA]/30 hover:shadow-[0_0_50px_-10px_rgba(167,139,250,0.3)]`}
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4B5FD] bg-gradient-to-r from-[#A78BFA]/10 to-[#2DD4BF]/10 px-3 py-1 rounded-full border border-[#A78BFA]/20">
                                                    {paper.category || "Physics"}
                                                </span>
                                                {paper.verified ? (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF] bg-[#2DD4BF]/10 px-3 py-1 rounded-full border border-[#2DD4BF]/20 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-[#C4B5FD] transition-colors">
                                                {paper.title}
                                            </h3>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <span className="text-lg font-black text-[#A78BFA]">{paper.price || "0.0001"}</span>
                                            <span className="text-xs text-[#94A3B8] ml-1">ETH</span>
                                        </div>
                                    </div>

                                    <p className="text-[#CBD5E1] leading-relaxed text-sm line-clamp-2 mb-4">
                                        {paper.abstract}
                                    </p>

                                    <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" /> {formatDate(paper.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[#2DD4BF]">
                                            <Shield className="w-3.5 h-3.5" /> On-Chain
                                        </span>
                                        {paper.token_id && (
                                            <span className="flex items-center gap-1.5 font-mono">
                                                Token #{paper.token_id}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

