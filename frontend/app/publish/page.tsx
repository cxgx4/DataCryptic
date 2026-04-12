// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import {
  Lock,
  Wallet,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Globe,
  UploadCloud,
  FileText,
  ShieldCheck,
  Coins
} from "lucide-react";

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = "0x78d71a5e6B306e379f486C832615aae370ff051B";

const ABI = [
  {
    inputs: [
      { internalType: "string", name: "tokenURI", type: "string" },
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "litReview", type: "string" },
      { internalType: "string", name: "findings", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "listExperiment",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllItems",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "seller", type: "address" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "litReview", type: "string" },
          { internalType: "string", name: "findings", type: "string" },
          { internalType: "bool", name: "isSold", type: "bool" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct FailVault.Item[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default function PublishPage() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [account, setAccount] = useState("");

  // Form State
  const [title, setTitle] = useState("Test Experiment");
  const [abstract, setAbstract] = useState("Test abstract for experiment");
  const [findings, setFindings] = useState("Test findings for experiment");
  const [price, setPrice] = useState("0.0001");
  const [category, setCategory] = useState("Physics");

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    try {
      setStatus("Connecting wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setStatus("Wallet connected!");
    } catch (error) {
      console.error("Wallet connection error:", error);
      setStatus("Failed to connect wallet");
    }
  };

  const mintNFT = async () => {
    try {
      setIsLoading(true);
      setStatus("Starting mint process...");

      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      if (network.chainId !== 80002n) {
        setStatus("Switching to Polygon Amoy...");
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13882" }],
          });
          window.location.reload();
          return;
        } catch (switchError) {
          alert("Please switch your MetaMask to Polygon Amoy manually.");
          setIsLoading(false);
          return;
        }
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tokenURI = `ipfs://experiment-${Date.now()}`;
      const priceInWei = ethers.parseEther(price || "0.0001");

      // Fetch fee data to handle gas pricing explicitly for Polygon Amoy
      const feeData = await provider.getFeeData();
      console.log("Current Fee Data:", feeData);

      const tx = await contract.listExperiment(
        tokenURI,
        title || "Test Experiment",
        abstract || "Test Abstract",
        findings || "Test Findings",
        priceInWei,
        {
          gasLimit: 3000000,
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
        }
      );

      setStatus("Transaction submitted! Waiting for confirmation...");
      const receipt = await tx.wait();

      let tokenId = null;
      if (receipt.logs) {
        tokenId = parseInt(Date.now().toString().slice(-6));
      }

      setStatus("Saving to database...");
      const { error } = await supabase.from("experiments").insert([
        {
          title: title || "Untitled Experiment",
          author: `${address.slice(0, 6)}...${address.slice(-4)}`,
          wallet_address: address,
          abstract: abstract || "",
          findings: findings || "",
          date: new Date().toISOString(),
          price: price || "0.0001",
          category: category || "Physics",
          verified: false,
          token_id: tokenId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) console.error("Supabase error:", error);

      setStatus("Success! NFT minted and saved.");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Mint error:", err);
      let errorMessage = err.message || "Transaction failed";

      if (err.message?.includes("user rejected")) {
        errorMessage = "You rejected the transaction.";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Not enough MATIC for gas fees.";
      }

      setStatus(`Error: ${errorMessage.slice(0, 60)}...`);
      setIsLoading(false);
    }
  };

  // ================= UI Implementation =================
  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 font-sans selection:bg-violet-500/30 overflow-hidden relative">

      {/* Background Ambience & Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-900/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/15 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full border-b border-white/10 bg-[#050316]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="font-bold text-white text-xl">D</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-white text-lg tracking-wide">DataCrypt</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Knowledge Vault</span>
            </div>
          </div>

          <Link href="/" className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-slate-300 backdrop-blur-md">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Return to Archive
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_380px] gap-10">

        {/* Left Column: Form */}
        <div className="space-y-8">

          {/* Status Message */}
          {status && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm backdrop-blur-md ${status.includes("Error") ? "bg-red-500/10 border-red-500/20 text-red-200" :
              status.includes("Success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" :
                "bg-violet-500/10 border-violet-500/20 text-violet-200"
              }`}>
              {status.includes("Error") ? <AlertCircle className="w-4 h-4" /> :
                status.includes("Success") ? <CheckCircle className="w-4 h-4" /> :
                  <Loader2 className="w-4 h-4 animate-spin" />}
              {status}
            </div>
          )}

          {/* Card 1: Public Metadata */}
          <div className="relative group rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent border border-white/5 shadow-[0_0_60px_-15px_rgba(124,58,237,0.15)] backdrop-blur-2xl">
            <div className="relative rounded-[31px] bg-[#0A0C14]/70 p-8 space-y-8 backdrop-blur-xl">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Public Research Metadata</h2>
                    <p className="text-sm text-slate-400 mt-1">Visible to all researchers in the marketplace</p>
                  </div>
                </div>
                <Globe className="w-7 h-7 text-violet-500 opacity-60" />
              </div>

              {/* Form Fields */}
              <div className="space-y-7">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider ml-1">Experiment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#131625]/60 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder:text-slate-600 backdrop-blur-md"
                    placeholder="e.g. 'Analysis of Palladium Interaction failure under extreme temperatures...'"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-7">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider ml-1">Research Domain</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#131625]/60 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer backdrop-blur-md"
                      >
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Biology</option>
                        <option>Engineering</option>
                        <option>AI/ML</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider ml-1">Unlock Price (ETH)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#131625]/60 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-all backdrop-blur-md pr-24"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-violet-500/20 rounded-xl border border-violet-500/20 text-sm font-bold text-violet-300 backdrop-blur-md">
                        MATIC
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider ml-1">Abstract Summary</label>
                  <textarea
                    rows={5}
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    className="w-full bg-[#131625]/60 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-600 resize-none backdrop-blur-md"
                    placeholder="Briefly describe your hypothesis, methodology, and why this negative result is valuable to the community..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Encrypted Findings */}
          <div className="relative group rounded-[32px] p-[1px] bg-gradient-to-b from-emerald-900/20 via-emerald-900/10 to-transparent border border-emerald-500/10 shadow-[0_0_60px_-15px_rgba(16,185,129,0.15)] backdrop-blur-2xl">
            <div className="relative rounded-[31px] bg-[#0A0C14]/70 p-8 space-y-8 backdrop-blur-xl">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <span className="text-2xl font-bold text-[#020617]">2</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">Encrypted Findings</h2>
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Protected content only accessible to verified purchasers</p>
                  </div>
                </div>
                <Lock className="w-7 h-7 text-emerald-500 opacity-60" />
              </div>

              {/* Editor */}
              <div className="relative">
                <textarea
                  rows={10}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  className="w-full bg-[#0F121C]/60 border border-emerald-500/20 rounded-2xl px-6 py-5 text-emerald-100/90 font-mono text-sm leading-relaxed focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-700 resize-y backdrop-blur-md"
                  placeholder={`// Paste your raw data, specific failure points, unexpected results, and key conclusions here...
Example: 
  - Hypothesis: Compound X should catalyze reaction Y at 80°C
  - Actual Result: No catalytic activity observed at any tested temperature (20-100°C)
  - Data Points: [Attach relevant graphs or data tables]
  - Critical Insight: Traditional theory suggests activity should increase with temperature, but our results indicate complete inertness...`}
                />
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400/90 bg-emerald-950/40 w-fit px-4 py-2 rounded-full border border-emerald-900/60 backdrop-blur-md">
                  <Lock className="w-4 h-4" />
                  <span>This content will be encrypted and stored permanently on the blockchain.</span>
                </div>
              </div>

            </div>
          </div>

          {/* Mint Button Area */}
          <div className="pt-6">
            <button
              onClick={mintNFT}
              disabled={isLoading || !account}
              className={`w-full group relative overflow-hidden rounded-2xl py-6 px-8 font-bold text-xl text-white shadow-2xl transition-all backdrop-blur-xl
                ${!account ? "bg-slate-800/70 cursor-not-allowed text-slate-500 border border-white/5" : "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 hover:shadow-[0_0_40px_-5px_rgba(192,38,211,0.4)] border border-white/10"}
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span>Processing Transaction...</span>
                </div>
              ) : !account ? (
                <div onClick={connectWallet} className="flex items-center justify-center gap-3 cursor-pointer pointer-events-auto">
                  <Wallet className="w-7 h-7" />
                  <span>Connect Wallet to Mint</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <Sparkles className="w-6 h-6 text-yellow-200" />
                  <span>Mint Research NFT for {price} MATIC</span>
                  <span className="text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">Secure & Permanent</span>
                </div>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-8">

          {/* Upload Card */}
          <div className="rounded-[32px] border border-white/10 bg-[#0A0C14]/70 p-8 space-y-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Attach Supporting Documents</h3>
              <span className="text-[10px] uppercase tracking-wider bg-slate-800/60 text-slate-300 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">Optional</span>
            </div>

            <label htmlFor="file-upload" className="border-2 border-dashed border-slate-700/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all cursor-pointer group backdrop-blur-md">
              <div className="w-14 h-14 rounded-full bg-slate-900/70 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors backdrop-blur-md">
                <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-violet-400" />
              </div>
              <div>
                <p className="text-base text-slate-300 font-semibold">Click to upload files</p>
                <p className="text-sm text-slate-500 mt-2">PDF, DOCX, CSV, IMG (Max 25MB)</p>
              </div>
              <input id="file-upload" type="file" className="hidden" />
            </label>
          </div>

          {/* Process Card */}
          <div className="rounded-[32px] border border-white/10 bg-[#0A0C14]/70 p-8 space-y-6 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-3 text-slate-200">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-lg">Publication Process</h3>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4 relative before:absolute before:left-5 before:top-10 before:h-full before:w-[2px] before:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0 z-10 shadow-lg shadow-violet-600/20">1</div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-base font-bold text-white">Fill Public Details</p>
                  <p className="text-sm text-slate-400 leading-relaxed">Title, abstract, and category help others discover your work.</p>
                </div>
              </div>
              <div className="flex gap-4 relative before:absolute before:left-5 before:top-10 before:h-full before:w-[2px] before:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-slate-800/70 border border-slate-700/50 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0 z-10 backdrop-blur-md">2</div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-base font-bold text-slate-300">Encrypt Findings</p>
                  <p className="text-sm text-slate-500 leading-relaxed">Your data is secured with blockchain encryption.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800/70 border border-slate-700/50 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0 z-10 backdrop-blur-md">3</div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-base font-bold text-slate-300">Mint & Earn</p>
                  <p className="text-sm text-slate-500 leading-relaxed">Receive payments automatically when researchers access your findings.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-[32px] border border-white/10 bg-[#0A0C14]/70 p-8 space-y-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-3 text-slate-200">
              <Coins className="w-5 h-5" />
              <h3 className="font-bold text-lg">Archive Statistics</h3>
            </div>

            <div className="space-y-4 pt-3">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5">
                <span className="text-sm text-slate-400 font-medium">Avg. Earnings</span>
                <span className="text-lg font-bold text-violet-300">0.85 ETH</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5">
                <span className="text-sm text-slate-400 font-medium">Published Exp.</span>
                <span className="text-lg font-bold text-emerald-300">5,163+</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5">
                <span className="text-sm text-slate-400 font-medium">Community Impact</span>
                <span className="text-lg font-bold text-blue-300">94%</span>
              </div>
            </div>
          </div>

        </aside>

      </main>
    </div>
  );
}
