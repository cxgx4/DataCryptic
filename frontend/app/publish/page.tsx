// @ts-nocheck
"use client";
import { useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient"; // IMPORT SUPABASE
import { MdScience, MdLock, MdPublic, MdCheckCircle, MdError } from "react-icons/md";
import { BiWallet, BiRightArrowAlt, BiLoaderAlt } from "react-icons/bi";
import { FiFileText, FiHelpCircle } from "react-icons/fi";

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = "0x2A5799Cc7E9708b39D14014C143451ABf4938fBd"; 
const ABI = ["function mintExperiment(string memory tokenURI) public returns (uint256)"];

export default function PublishPage() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [findings, setFindings] = useState("");

  const mintNFT = async () => {
    if (!title || !abstract || !findings) return alert("Please fill all fields");
    if (!window.ethereum) return alert("Install MetaMask");

    try {
      setIsLoading(true);
      setStatus("Initializing Wallet...");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      setStatus("Confirm transaction in MetaMask...");

      const tx = await contract.mintExperiment("ipfs://fake-uri", { 
        gasLimit: 500000 
      });
      
      setStatus("Minting in progress...");
      await tx.wait();
      setStatus("Saving to Supabase Database...");

      // --- NEW: SAVE TO SUPABASE ---
      const { error } = await supabase
        .from('experiments')
        .insert([
          {
            title: title,
            author: signer.address.slice(0, 6) + "..." + signer.address.slice(-4),
            wallet_address: signer.address, 
            abstract: abstract,
            findings: findings,
            date: new Date().toLocaleDateString(),
            price: "0.0001",
            category: "Physics" // Default category for now
          }
        ]);

      if (error) throw error;

      setStatus("Success! Redirecting...");
      setTimeout(() => router.push("/"), 1000);

    } catch (error) {
      console.error(error);
      setStatus("Error: " + (error.reason || error.message));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <MdScience className="text-purple-500 text-2xl" />
                <h1 className="text-2xl font-bold tracking-tight">FailVault</h1>
            </div>
            <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 hover:bg-white/5 px-4 py-2 rounded-full">
            <BiRightArrowAlt className="rotate-180" />
            Back to Search
            </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
            <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Publish Research</h2>
            <p className="text-gray-400 max-w-2xl text-lg">Turn your negative results into valuable assets.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
                <section className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-blue-500/20 text-blue-400 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border border-blue-500/30">1</span>
                        <h3 className="text-xl font-bold flex items-center gap-2"><MdPublic className="text-gray-400" /> Public Metadata</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Experiment Title</label>
                            <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. Analysis of Palladium Interaction" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Abstract Summary</label>
                            <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all h-32 resize-none"
                                placeholder="Briefly describe the hypothesis..." value={abstract} onChange={e => setAbstract(e.target.value)}></textarea>
                        </div>
                    </div>
                </section>

                <section className="bg-gradient-to-b from-purple-900/10 to-transparent border border-purple-500/20 rounded-2xl p-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border border-purple-500/30">2</span>
                            <h3 className="text-xl font-bold flex items-center gap-2 text-purple-100"><MdLock className="text-purple-400" /> Locked Findings</h3>
                        </div>
                    </div>
                    <div>
                        <textarea className="w-full bg-black/60 border border-purple-500/30 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-all h-48 resize-none font-mono text-sm"
                            placeholder="Paste your raw data here..." value={findings} onChange={e => setFindings(e.target.value)}></textarea>
                    </div>
                </section>

                <div className="pt-4 pb-12">
                    <button onClick={mintNFT} disabled={isLoading}
                        className={`w-full relative group overflow-hidden rounded-xl p-4 font-bold text-lg transition-all ${isLoading ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-white text-black hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/10'}`}>
                        <span className="flex items-center justify-center gap-2">
                            {isLoading ? <BiLoaderAlt className="animate-spin" /> : <BiWallet />}
                            {isLoading ? "Processing..." : "Mint & Publish to Blockchain"}
                        </span>
                    </button>
                    {status && (
                        <div className={`mt-4 p-4 rounded-lg flex items-center justify-center gap-3 text-sm font-medium ${status.includes("Error") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                            {status.includes("Error") ? <MdError /> : <MdCheckCircle />}
                            {status}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="hidden lg:block space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2"><FiHelpCircle /> How it works</h4>
                    <p className="text-sm text-gray-400">Fill out public info, lock your findings, and mint. Users pay 0.0001 ETH to see your locked data.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}