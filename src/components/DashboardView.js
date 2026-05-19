import React, { useState, useEffect, useCallback } from "react";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  DollarSign,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  RefreshCcw,
  Zap,
  Activity,
} from "lucide-react";

export default function DashboardView() {
  const [stats, setStats] = useState({
    dailyRevenue: "0.00",
    dailyProfit: "0.00",
    dailyOrders: 0,
    totalRevenue: "0.00",
    totalProfit: "0.00",
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filter State (Format: YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const dateOptions = {
      timeZone: "Africa/Accra",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date()
      .toLocaleDateString("en-ZA", dateOptions)
      .replace(/\//g, "-");
  });

  const fetchBoomStats = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics for the Selected Day Ledger using the functional getDoc() helper
      const dailyDocRef = doc(db, "boom_analytics", selectedDate);
      const dailySnapshot = await getDoc(dailyDocRef);

      let dRev = 0;
      let dProfit = 0;
      let dOrders = 0;

      if (dailySnapshot.exists()) {
        const dData = dailySnapshot.data();
        dRev = Number(dData.salestransaction || 0);
        dProfit = Number(dData.profit || 0);
        dOrders = Number(dData.ordercount || 0);
      }

      // 2. Fetch Aggregated All-Time Totals across the boom_analytics ledger
      const allAnalyticsQuery = query(collection(db, "boom_analytics"));
      const querySnapshot = await getDocs(allAnalyticsQuery);

      let tRev = 0;
      let tProfit = 0;
      let tOrders = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tRev += Number(data.salestransaction || 0);
        tProfit += Number(data.profit || 0);
        tOrders += Number(data.ordercount || 0);
      });

      setStats({
        dailyRevenue: dRev.toFixed(2),
        dailyProfit: dProfit.toFixed(2),
        dailyOrders: dOrders,
        totalRevenue: tRev.toFixed(2),
        totalProfit: tProfit.toFixed(2),
        totalOrders: tOrders,
      });
    } catch (err) {
      console.error("Error loading BOOM ledger insights:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchBoomStats();
  }, [fetchBoomStats]);

  if (loading)
    return (
      <div className="p-8 text-slate-400 animate-pulse flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCcw className="animate-spin mb-4 text-orange-500" size={32} />
        <p className="font-medium tracking-tight">
          Syncing BOOM Accounting Records...
        </p>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Top Banner Control Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Zap className="text-orange-500 fill-orange-500/10" size={28} />
            BOOM System Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ledger processing, profit tracking, and JusticeData
            settlement monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-2">
              Ledger Day:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            onClick={fetchBoomStats}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-95"
            title="Refresh Ledger"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* --- SECTION 1: Single Day Performance --- */}
      <div className="bg-slate-900/10 border border-slate-850 p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
          <Activity size={18} className="text-orange-400" />
          <h2 className="text-lg font-bold text-slate-200">
            Performance Summary for ({selectedDate})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Day Revenue"
            value={`GH¢ ${stats.dailyRevenue}`}
            icon={<DollarSign size={20} />}
            color="blue"
          />
          <StatCard
            label="Net Profit margin"
            value={`GH¢ ${stats.dailyProfit}`}
            icon={<TrendingUp size={20} />}
            color="emerald"
          />
          <StatCard
            label="Successful Deliveries"
            value={`${stats.dailyOrders} Transactions`}
            icon={<ShoppingBag size={20} />}
            color="amber"
          />
        </div>
      </div>

      {/* --- SECTION 2: All-Time Cumulative Performance --- */}
      <div className="bg-slate-900/10 border border-slate-850 p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
          <BarChart3 size={18} className="text-purple-400" />
          <h2 className="text-lg font-bold text-slate-200">
            All-Time Accumulation Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Gross Transacted Revenue"
            value={`GH¢ ${stats.totalRevenue}`}
            icon={<DollarSign size={20} />}
            color="purple"
          />
          <StatCard
            label="Total System Profit"
            value={`GH¢ ${stats.totalProfit}`}
            icon={<TrendingUp size={20} />}
            color="emerald"
          />
          <StatCard
            label="Total Delivery Volume"
            value={`${stats.totalOrders} Orders`}
            icon={<ShoppingBag size={20} />}
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  return (
    <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 shadow-xl backdrop-blur-md hover:border-slate-700/80 transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </span>
        <div className={`p-2 rounded-xl border ${colors[color]}`}>{icon}</div>
      </div>
      <h3 className={`text-2xl font-bold mt-4 ${colors[color].split(" ")[0]}`}>
        {value}
      </h3>
    </div>
  );
}
