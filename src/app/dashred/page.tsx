'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import {
    LayoutDashboard,
    QrCode,
    RefreshCw,
    MessageCircle, // WhatsApp similar
    LogOut,
    Menu,
    X,
    Trash2,
    Edit2,
    Search,
    ChevronLeft,
    ChevronRight,
    Save,
    MoreVertical,
    DollarSign,
    Users,
    TrendingUp,
    Smartphone,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- Types ---
interface Lead {
    id: string;
    email: string;
    phone: string;
    plan: string;
    price: string;
    status: string;
    createdAt: Timestamp | null;
}

// --- Helpers ---
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(val);
};

const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.replace(/[^\d.,]/g, '');
    const dotStr = cleanStr.replace(',', '.');
    const val = parseFloat(dotStr);
    return isNaN(val) ? 0 : val;
};

// --- Main Component ---
export default function AdminDashboard() {
    const SECRET_PASSWORD = 'dviela123';

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authChecking, setAuthChecking] = useState(true);

    // Data State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Desktop collapse
    const [activeTab, setActiveTab] = useState<'dashboard' | 'pix' | 'remarketing' | 'renewals'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Modal State
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [editForm, setEditForm] = useState<Partial<Lead>>({});

    // Auth Check
    useEffect(() => {
        const stored = localStorage.getItem('redflix_admin_session');
        if (stored) {
            const { timestamp } = JSON.parse(stored);
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            }
        }
        setAuthChecking(false);
    }, []);

    // Load Data
    useEffect(() => {
        if (!isAuthenticated) return;
        const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
            setLoading(false);
        });
        return () => unsub();
    }, [isAuthenticated]);

    // Handlers
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === SECRET_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('redflix_admin_session', JSON.stringify({ timestamp: Date.now() }));
        } else {
            alert('Acesso Negado');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('redflix_admin_session');
        setIsAuthenticated(false);
    };

    // --- Bulk Operations ---
    const handleDeleteAll = async () => {
        if (!confirm('🚨 PERIGO: Isso apagará TODOS os leads do sistema.\n\nTem certeza absoluta? Digite "sim" na sua mente e clique em OK.')) return;
        if (!confirm('Última chance: Isso é irreversível. Confirmar exclusão total?')) return;

        try {
            setLoading(true);
            const batchSize = 400; // Firestore limit is 500
            const chunks = [];

            for (let i = 0; i < leads.length; i += batchSize) {
                const chunk = leads.slice(i, i + batchSize);
                const batch = writeBatch(db);
                chunk.forEach(lead => {
                    batch.delete(doc(db, "leads", lead.id));
                });
                chunks.push(batch.commit());
            }

            await Promise.all(chunks);
            alert('Todos os registros foram apagados.');
        } catch (error) {
            console.error(error);
            alert('Erro ao apagar registros.');
        } finally {
            setLoading(false);
        }
    };

    // --- Edit Operations ---
    const openEditModal = (lead: Lead) => {
        setEditingLead(lead);
        setEditForm({ ...lead });
    };

    const saveEdit = async () => {
        if (!editingLead || !editForm) return;
        try {
            await updateDoc(doc(db, "leads", editingLead.id), {
                email: editForm.email,
                phone: editForm.phone,
                plan: editForm.plan,
                price: editForm.price,
                status: editForm.status
            });
            setEditingLead(null);
            alert('Atualizado com sucesso!');
        } catch (e) {
            alert('Erro ao atualizar.');
        }
    };

    const deleteSingle = async (id: string) => {
        if (confirm('Deletar este registro?')) {
            await deleteDoc(doc(db, "leads", id));
        }
    };

    // --- Filtering ---
    const filteredLeads = useMemo(() => {
        return leads.filter(l =>
            l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.phone.includes(searchTerm)
        );
    }, [leads, searchTerm]);

    // --- Stats ---
    const stats = useMemo(() => {
        const revenue = leads.reduce((acc, curr) => acc + (curr.status === 'approved' ? parsePrice(curr.price) : 0), 0);
        const active = leads.filter(l => l.status === 'approved').length;
        return { revenue, active, total: leads.length };
    }, [leads]);

    if (authChecking) return null;

    // --- LOGIN SCREEN (Premium Design) ---
    if (!isAuthenticated) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(229,9,20,0.15),transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative z-10 backdrop-blur-xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_30px_rgba(229,9,20,0.2)]">
                        <ShieldCheck className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-black italic text-white tracking-tight">REDFLIX <span className="text-primary">ADMIN</span></h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2">Acesso Restrito</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="••••••"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-white tracking-[0.5em] focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:tracking-normal"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="w-full bg-primary hover:bg-red-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20">
                        Entrar
                    </button>
                </form>
            </motion.div>
        </div>
    );

    // --- DASHBOARD LAYOUT ---
    return (
        <div className="min-h-screen bg-[#020202] text-white flex font-sans overflow-hidden">

            {/* SIDEBAR (Collapsible) */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
                className="hidden md:flex flex-col border-r border-white/5 bg-[#050505] z-50 transition-all duration-300 relative"
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white z-50"
                >
                    {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Logo Area */}
                <div className="h-20 flex items-center justify-center border-b border-white/5">
                    {sidebarCollapsed ? (
                        <span className="text-primary font-black italic text-2xl">R</span>
                    ) : (
                        <span className="text-white font-black italic text-xl tracking-tight">REDFLIX <span className="text-primary text-[10px]">PRO</span></span>
                    )}
                </div>

                {/* Menu Items */}
                <nav className="flex-1 py-8 px-3 space-y-2">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
                        { id: 'pix', icon: QrCode, label: 'Gerar Pix Manual' },
                        { id: 'remarketing', icon: RefreshCw, label: 'Remarketing' },
                        { id: 'renewals', icon: TrendingUp, label: 'Renovações' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative overflow-hidden ${activeTab === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {!sidebarCollapsed && (
                                <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">{item.label}</span>
                            )}
                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                                <div className="absolute left-16 bg-[#1a1a1a] px-3 py-1 rounded-md text-[10px] uppercase font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 ml-2 whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-3 text-gray-600 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors">
                        <LogOut size={20} />
                        {!sidebarCollapsed && <span className="text-xs font-bold uppercase">Sair</span>}
                    </button>
                </div>
            </motion.aside>

            {/* MAIN CONTENT Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-white/5 bg-[#050505] flex items-center justify-between px-4 z-40">
                    <div className="font-black italic text-lg">REDFLIX</div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-400">
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-0 z-50 bg-[#050505] md:hidden p-6"
                        >
                            <div className="flex justify-end mb-8">
                                <button onClick={() => setSidebarOpen(false)}><X size={32} /></button>
                            </div>
                            <nav className="space-y-4">
                                {['dashboard', 'pix', 'remarketing', 'renewals'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => { setActiveTab(t as any); setSidebarOpen(false); }}
                                        className="block w-full text-left text-2xl font-black uppercase text-white py-4 border-b border-white/10"
                                    >
                                        {t}
                                    </button>
                                ))}
                                <button onClick={handleLogout} className="block w-full text-left text-xl font-bold text-red-500 py-4 mt-8">Sair do Sistema</button>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CONTENT SCROLL AREA */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">

                    {/* --- DASHBOARD TAB --- */}
                    {activeTab === 'dashboard' && (
                        <div className="max-w-7xl mx-auto space-y-8">

                            {/* Stats Cards (Compact Mobile) */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                                <div className="bg-[#0a0a0a] p-4 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <DollarSign size={40} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Receita Total</p>
                                    <h3 className="text-lg md:text-3xl font-black italic text-white mt-1">{formatCurrency(stats.revenue)}</h3>
                                </div>
                                <div className="bg-[#0a0a0a] p-4 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Users size={40} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ativos</p>
                                    <h3 className="text-lg md:text-3xl font-black italic text-white mt-1">{stats.active}</h3>
                                </div>
                                <div className="col-span-2 md:col-span-1 bg-primary/10 p-4 md:p-6 rounded-2xl border border-primary/20 relative overflow-hidden group">
                                    <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Taxa de Conversão</p>
                                    <h3 className="text-lg md:text-3xl font-black italic text-white mt-1">
                                        {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%
                                    </h3>
                                </div>
                            </div>

                            {/* Table Section */}
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <h2 className="text-xl font-black italic">Últimas Transações</h2>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar por email ou telefone..."
                                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-white/20"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleDeleteAll}
                                            className="px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                                        >
                                            <Trash2 size={16} className="md:hidden" />
                                            <span className="hidden md:inline">Apagar Todos</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Modern Table List - Card style on Mobile */}
                                <div className="grid gap-2">
                                    {filteredLeads.map(lead => (
                                        <motion.div
                                            key={lead.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-colors"
                                        >
                                            {/* Info Block */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-2 h-2 rounded-full ${lead.status === 'approved' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
                                                    <h4 className="font-bold text-sm text-white truncate">{lead.email}</h4>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-mono">
                                                    <span>{lead.phone}</span>
                                                    <span className="text-gray-700">|</span>
                                                    <span>{lead.plan}</span>
                                                    <span className="text-gray-700">|</span>
                                                    <span className="text-gray-300 font-bold">{formatCurrency(parsePrice(lead.price))}</span>
                                                </div>
                                            </div>

                                            {/* Actions Block */}
                                            <div className="flex items-center gap-2 self-end md:self-auto">
                                                <a
                                                    href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors border border-green-500/20"
                                                >
                                                    <MessageCircle size={16} />
                                                </a>
                                                <button
                                                    onClick={() => openEditModal(lead)}
                                                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteSingle(lead.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredLeads.length === 0 && (
                                        <div className="text-center py-10 text-gray-600 text-xs uppercase tracking-widest">Nenhum registro encontrado</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- OTHER TABS PLACEHOLDERS (To keep file clean, straightforward implementation) --- */}
                    {activeTab !== 'dashboard' && (
                        <div className="h-full flex flex-col items-center justify-center opacity-50">
                            <h2 className="text-2xl font-black italic uppercase text-gray-600">Em Desenvolvimento</h2>
                            <p className="text-xs text-gray-700 uppercase tracking-widest mt-2">{activeTab}</p>
                        </div>
                    )}
                </div>
            </main>

            {/* --- EDIT MODAL --- */}
            <AnimatePresence>
                {editingLead && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0f0f0f] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black italic uppercase">Editar Lead</h3>
                                <button onClick={() => setEditingLead(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Email</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-sm focus:border-primary/50 outline-none text-white"
                                        value={editForm.email || ''}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-500">WhatsApp</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-sm focus:border-primary/50 outline-none text-white"
                                        value={editForm.phone || ''}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-500">Valor</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-sm focus:border-primary/50 outline-none text-white"
                                            value={editForm.price || ''}
                                            onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-500">Status</label>
                                        <select
                                            className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-sm focus:border-primary/50 outline-none text-white appearance-none"
                                            value={editForm.status || 'pending'}
                                            onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                        >
                                            <option value="pending">Pendente</option>
                                            <option value="approved">Aprovado</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={saveEdit}
                                    className="w-full bg-primary hover:bg-red-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs mt-4 transition-all"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
