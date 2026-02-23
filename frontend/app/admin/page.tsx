// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { 
  Search, Trash2, Eye, LogOut, 
  AlertTriangle, CheckCircle, Calendar, 
  FileText, User, BarChart3, Clock, 
  Shield, ChevronUp, ChevronDown, Check, X,
  TrendingUp, Activity
} from "lucide-react";
import { 
  LineChart, Line, ResponsiveContainer, 
  PieChart, Pie, Cell, Tooltip 
} from "recharts";

const ADMIN_ADDRESS = "0x09aa54130858C1B6d82243FC12536A684221DC46";

// --- COLORS FOR CHARTS ---
const COLORS = ['#4ade80', '#fbbf24', '#f87171']; // Green, Yellow, Red

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [paperToView, setPaperToView] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [hoveredButton, setHoveredButton] = useState(null);
  
  // Stats State
  const [stats, setStats] = useState({ 
    total: 0, 
    thisMonth: 0, 
    pending: 0,
    verified: 0,
    monthlyTrend: [], // Data for sparkline
    distribution: []  // Data for pie chart
  });

  useEffect(() => {
    checkAdmin();
    fetchData();
  }, []);

  useEffect(() => {
    if (experiments.length > 0) {
      calculateStats(experiments);
    }
  }, [experiments]);

  const calculateStats = (data) => {
    const total = data.length;
    const now = new Date();
    
    // 1. Basic Counts
    const thisMonthCount = data.filter(exp => {
      const expDate = new Date(exp.created_at);
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).length;
    
    const verified = data.filter(exp => exp.verified).length;
    const pending = data.filter(exp => !exp.verified).length;
    
    // 2. Sparkline Data (Last 6 Months)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const count = data.filter(exp => {
        const expDate = new Date(exp.created_at);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear();
      }).length;
      trendData.push({ name: monthName, papers: count });
    }

    // 3. Pie Chart Data
    const distributionData = [
      { name: 'Verified', value: verified },
      { name: 'Pending', value: pending },
      // Assuming deleted items are removed from DB, we don't count 'Rejected' unless you have a specific status field for it.
      // If you just delete them, this is fine.
    ];

    setStats({ 
      total, 
      thisMonth: thisMonthCount, 
      verified, 
      pending,
      monthlyTrend: trendData,
      distribution: distributionData
    });
  };

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
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setExperiments(data);
    setLoading(false);
  };

  const handleVerification = async (id, status) => {
    const previousExperiments = [...experiments];
    const updatedLocal = experiments.map(exp => 
        exp.id === id ? { ...exp, verified: status } : exp
    );
    setExperiments(updatedLocal);

    const { error } = await supabase
        .from('experiments')
        .update({ verified: status })
        .eq('id', id);

    if (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status");
        setExperiments(previousExperiments);
    }
  };

  const handleViewDetails = (experiment) => {
    setPaperToView(experiment);
    setViewModalOpen(true);
  };

  const handleDelist = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      const { error } = await supabase
        .from('experiments')
        .delete()
        .eq('id', itemToDelete);
      
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    
    const sortedData = [...experiments].sort((a, b) => {
      const aValue = a[key]?.toString().toLowerCase() || '';
      const bValue = b[key]?.toString().toLowerCase() || '';
      
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
    
    setExperiments(sortedData);
  };

  const filteredExperiments = experiments.filter(exp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      exp.title?.toLowerCase().includes(searchLower) ||
      exp.author?.toLowerCase().includes(searchLower) ||
      exp.abstract?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-transparent border-t-red-500 border-r-red-700 rounded-full animate-spin"></div>
        <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-400" />
      </div>
      <p className="mt-4 text-gray-400">Loading Admin Dashboard...</p>
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white text-center">
        <div className="border border-gray-800 p-8 rounded-xl bg-gradient-to-br from-gray-900/50 to-black/50">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">Connect with the admin wallet to access this dashboard</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-medium hover:from-red-700 hover:to-red-900 transition-all"
          >
            <LogOut className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-gray-800/50 p-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-900/20 to-red-950/10 border border-red-800/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                Admin Command Center
              </h1>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">Verify & Manage Archives</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-red-500/50 hover:bg-red-950/20 transition-all group text-sm font-medium"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Exit Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        
        {/* --- VISUAL STATS DASHBOARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          
          {/* Card 1: Total & Trend */}
          <div className="md:col-span-4 bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-red-900/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="w-24 h-24 text-red-500" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Papers</p>
                <h3 className="text-4xl font-black text-white mt-1">{stats.total}</h3>
              </div>
              <div className="bg-green-500/10 text-green-400 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{stats.thisMonth} New
              </div>
            </div>
            
            {/* Sparkline Chart */}
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyTrend}>
                  <Line type="monotone" dataKey="papers" stroke="#f87171" strokeWidth={2} dot={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} 
                    itemStyle={{ color: '#f87171' }}
                    labelStyle={{ display: 'none' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Status Distribution Pie Chart */}
          <div className="md:col-span-4 bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 rounded-2xl p-6 relative flex items-center justify-between hover:border-blue-900/50 transition-all">
             <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Status Overview</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.4)]"></div>
                    <span className="text-sm text-gray-300">Verified: <span className="text-white font-bold">{stats.verified}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]"></div>
                    <span className="text-sm text-gray-300">Pending: <span className="text-white font-bold">{stats.pending}</span></span>
                  </div>
                </div>
             </div>
             <div className="w-24 h-24">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={stats.distribution}
                     cx="50%"
                     cy="50%"
                     innerRadius={25}
                     outerRadius={40}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {stats.distribution.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Card 3: Action Required */}
          <div className="md:col-span-4 bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 rounded-2xl p-6 flex flex-col justify-center hover:border-yellow-900/50 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-900/20 rounded-lg text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Action Needed</p>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-black text-white">{stats.pending}</h3>
              <p className="text-sm text-gray-500">Papers awaiting verification.</p>
            </div>
            <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden">
               <div 
                  className="bg-yellow-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(stats.pending / (stats.total || 1)) * 100}%` }}
               ></div>
            </div>
          </div>
        </div>

        {/* SEARCH & CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiments by title, author, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
          </div>
          
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-all font-medium flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/30">
                <th 
                  className="text-left p-6 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Research Title
                    {sortConfig.key === "title" && (
                      sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-6 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("author")}
                >
                  <div className="flex items-center gap-2">
                    Author
                    {sortConfig.key === "author" && (
                      sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th className="text-left p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted</th>
                <th className="text-right p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredExperiments.map((exp) => (
                <tr 
                  key={exp.id} 
                  className="hover:bg-gray-900/40 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded bg-gray-900 border border-gray-700 text-gray-400 group-hover:text-red-400 group-hover:border-red-900 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="font-semibold text-white mb-1 truncate">{exp.title}</h3>
                        {exp.abstract && (
                          <p className="text-xs text-gray-500 line-clamp-1">{exp.abstract}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold">
                        {exp.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[120px]">{exp.author}</span>
                    </div>
                  </td>
                  
                  {/* Status Column */}
                  <td className="p-6">
                    {exp.verified ? (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle className="w-3 h-3" /> Verified
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                          <Clock className="w-3 h-3" /> Pending Review
                       </span>
                    )}
                  </td>

                  <td className="p-6 text-sm text-gray-500 font-mono">
                    {formatDate(exp.created_at)}
                  </td>

                  {/* Actions Column */}
                  <td className="p-6">
                    <div className="flex items-center justify-end gap-2">
                       {/* Verify Button (Only if not verified) */}
                       {!exp.verified && (
                         <button 
                           onClick={() => handleVerification(exp.id, true)}
                           className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-900/50"
                           title="Approve"
                         >
                           <Check className="w-4 h-4" />
                         </button>
                       )}

                       {/* View Button */}
                       <button 
                          onClick={() => handleViewDetails(exp)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-900/50"
                          title="View Details"
                       >
                          <Eye className="w-4 h-4" />
                       </button>

                       {/* Delete/Reject Button */}
                       <button 
                          onClick={() => handleDelist(exp.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-900/50"
                          title="Reject / Delete"
                       >
                          {!exp.verified ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredExperiments.length === 0 && (
            <div className="p-12 text-center border-t border-gray-800">
              <div className="inline-flex p-4 rounded-full bg-gray-900 border border-gray-800 mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No experiments found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Delete Entry?</h3>
                    <p className="text-gray-400 text-sm">This action cannot be undone.</p>
                </div>
            </div>
            
            <div className="p-4 rounded-lg bg-black border border-gray-800 mb-8">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Target Experiment</div>
              <div className="font-medium text-white">
                {experiments.find(e => e.id === itemToDelete)?.title}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-900/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW PAPER DETAILS MODAL --- */}
      {viewModalOpen && paperToView && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-md">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-black relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700 uppercase">
                        ID: {paperToView.id}
                    </span>
                    {paperToView.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/30 text-green-400 border border-green-800 uppercase">Verified</span>
                    ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-900/30 text-yellow-400 border border-yellow-800 uppercase">Pending</span>
                    )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{paperToView.title}</h2>
              </div>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-8">
                <div>
                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        <FileText className="w-3 h-3" /> Abstract
                    </h3>
                    <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800 text-gray-300 leading-relaxed text-sm">
                        {paperToView.abstract}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <User className="w-3 h-3" /> Author
                        </h3>
                        <p className="text-white font-medium">{paperToView.author}</p>
                    </div>
                    <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <Calendar className="w-3 h-3" /> Submitted
                        </h3>
                        <p className="text-white font-medium">{formatDate(paperToView.created_at)}</p>
                    </div>
                </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/30 flex justify-end gap-3">
                <button 
                    onClick={() => setViewModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors text-white"
                >
                    Close View
                </button>
                {!paperToView.verified && (
                    <button 
                        onClick={() => {
                            handleVerification(paperToView.id, true);
                            setViewModalOpen(false);
                        }}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
                    >
                        <Check className="w-4 h-4" /> Verify & Approve
                    </button>
                )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}