// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient"; // IMPORT SUPABASE
import { Search, Filter, Download, Trash2, Edit, Eye, LogOut, AlertTriangle, CheckCircle } from "lucide-react";

const ADMIN_ADDRESS = "0x09aa54130858C1B6d82243FC12536A684221DC46";

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    checkAdmin();
    fetchData();
  }, []);

  const checkAdmin = async () => {
    if (window.ethereum) {
       const accounts = await window.ethereum.request({ method: "eth_accounts" });
       if (accounts.length > 0 && accounts[0].toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
         setIsAuthorized(true);
       }
    }
  };

  const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('experiments').select('*').order('created_at', { ascending: false });
      if (data) setExperiments(data);
      setLoading(false);
  };

  const handleDelist = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      // DELETE FROM SUPABASE
      const { error } = await supabase.from('experiments').delete().eq('id', itemToDelete);
      
      if (!error) {
        const updated = experiments.filter((exp) => exp.id !== itemToDelete);
        setExperiments(updated);
      } else {
        alert("Error deleting: " + error.message);
      }
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verifying Access...</div>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white text-center">
        <div>
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <Link href="/" className="text-cyan-400">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/50 border-b border-gray-800 p-6">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Research Admin</h1>
            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg border border-gray-800"><LogOut className="w-4 h-4" /> Exit</Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-6 text-gray-400">Title</th>
                  <th className="text-left p-6 text-gray-400">Author</th>
                  <th className="text-left p-6 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map((exp) => (
                  <tr key={exp.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="p-6 font-medium">{exp.title}</td>
                    <td className="p-6 text-gray-400">{exp.author}</td>
                    <td className="p-6">
                        <button onClick={() => handleDelist(exp.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/30"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {experiments.length === 0 && <div className="p-12 text-center text-gray-500">No papers found in Supabase.</div>}
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Delete Permanently?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-rose-600 rounded-lg font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}