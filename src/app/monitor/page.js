'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, Clock, AlertTriangle } from 'lucide-react';

export default function MonitoringDashboard() {
  const [health, setHealth] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [healthRes, monitorRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/monitor'),
      ]);

      const healthData = await healthRes.json();
      const monitorData = await monitorRes.json();

      setHealth(healthData);
      setMonitor(monitorData);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isHealthy = health?.status === 'healthy';
  const poolStats = health?.poolStats || {};
  const monitorData = monitor?.data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 MongoDB Connection Monitor
          </h1>
          <p className="text-gray-600">
            Real-time monitoring untuk koneksi database
          </p>
        </div>

        {/* Status Card */}
        <div className={`mb-6 p-6 rounded-xl shadow-lg ${
          isHealthy ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                isHealthy ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {isHealthy ? (
                  <Database className="w-8 h-8 text-white" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isHealthy ? 'Database Connected' : 'Connection Issue'}
                </h2>
                <p className="text-gray-600">
                  {health?.message}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Response Time</div>
              <div className="text-2xl font-bold">{health?.responseTime}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Connection Pool */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {poolStats.activeConnections || 0}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              / {poolStats.availableConnections + poolStats.activeConnections || 10} Total
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((poolStats.activeConnections || 0) / 10) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Total Connects */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">Connects</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {monitorData.connects || 0}
            </div>
            <div className="text-sm text-gray-600 mt-2">Total connections</div>
          </div>

          {/* Disconnects */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-gray-500">Disconnects</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {monitorData.disconnects || 0}
            </div>
            <div className="text-sm text-gray-600 mt-2">Total disconnects</div>
          </div>

          {/* Errors */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <span className="text-sm text-gray-500">Errors</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {monitorData.errors || 0}
            </div>
            <div className="text-sm text-gray-600 mt-2">Total errors</div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Info */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Connection Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Host</span>
                <span className="font-mono text-sm">{poolStats.host || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Database</span>
                <span className="font-mono text-sm">{poolStats.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">State</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  poolStats.readyState === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {monitorData.currentState || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Environment</span>
                <span className="font-mono text-sm">{monitorData.environment || 'development'}</span>
              </div>
            </div>
          </div>

          {/* Memory & Performance */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Memory Used</span>
                <span className="font-mono text-sm">
                  {monitorData.memory?.used || 0} MB
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Memory Total</span>
                <span className="font-mono text-sm">
                  {monitorData.memory?.total || 0} MB
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Uptime</span>
                <span className="font-mono text-sm">
                  {Math.floor(monitorData.uptime || 0)}s
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-mono text-sm">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto refresh notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          🔄 Auto-refresh setiap 5 detik
        </div>
      </div>
    </div>
  );
}
