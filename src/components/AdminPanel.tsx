import React, { useState } from 'react';
import { Database, ShieldCheck, Download, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function AdminPanel() {
  const [idNorma, setIdNorma] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!idNorma) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      setError('Debes iniciar sesión como superusuario');
      setLoading(false);
      return;
    }

    try {
      const token = await authService.getSessionToken();
      
      const res = await fetch('/api/admin/ingest-bcn', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idNorma, email: currentUser.email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error desconocido del servidor');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl mt-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-emerald-400 w-8 h-8" />
        <h2 className="text-2xl font-bold text-white">Panel de Superusuario</h2>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Ingestor de Leyes BCN (Biblioteca del Congreso)
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Esta herramienta descarga el XML oficial desde Ley Chile, extrae los artículos, genera los vectores matemáticos usando Gemini y los inyecta en Supabase `legal_sources` para el sistema RAG.
        </p>

        <form onSubmit={handleIngest} className="flex gap-4">
          <input
            type="number"
            value={idNorma}
            onChange={(e) => setIdNorma(e.target.value)}
            placeholder="ID Norma (Ej: 172986 para C. Civil)"
            className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Ingestar Ley
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-200 font-medium">{result.ley}</p>
              <p className="text-emerald-300/80 text-sm mt-1">{result.message}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-xs text-slate-500 flex justify-between">
        <span>Nota: Por límites de Serverless, los lotes procesan máximo 30 artículos por llamada.</span>
        <span>Modo Seguro: Validado con Role "superadmin"</span>
      </div>
    </div>
  );
}
