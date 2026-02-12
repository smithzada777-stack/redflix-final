'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import {
    LayoutDashboard,
    QrCode,
    RefreshCw,
    MessageCircle,
    LogOut,
    Menu,
    X,
    Trash2,
    Edit2,
    Search,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Smartphone,
    Send,
    Percent,
    Copy,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- Interfaces ---
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
const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.replace(/[^\d.,]/g, '');
    const dotStr = cleanStr.replace(',', '.');
    const val = parseFloat(dotStr);
    return isNaN(val) ? 0 : val;
};

const getDaysRemaining = (createdAt: Timestamp | null, plan: string) => {
    if (!createdAt) return 999;
    const startDate = createdAt.toDate();
    let duration = 30;
    const p = plan?.toLowerCase() || '';
    if (p.includes('trimestral')) duration = 90;
    else if (p.includes('semestral')) duration = 180;
    else if (p.includes('anual')) duration = 365;
    else if (p.includes('vitalício')) return 9999;

    const expiry = new Date(startDate);
    expiry.setDate(expiry.getDate() + duration);
    const diff = expiry.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function AdminDashboard() {
    const SECRET_PASSWORD = 'dviela123';

    // Auth
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authChecking, setAuthChecking] = useState(true);

    // Data
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    // UI
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'pix' | 'remarketing' | 'renewals'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Modal
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [editForm, setEditForm] = useState<Partial<Lead>>({});

    // Renewal Modal
    const [selectedRenewal, setSelectedRenewal] = useState<Lead | null>(null);
    const [discount, setDiscount] = useState(0);

    // Pix Generator
    const [pixAmount, setPixAmount] = useState('');
    const [pixName, setPixName] = useState('Cliente VIP');
    const [generatedPixString, setGeneratedPixString] = useState('');
    const [generatedPixImage, setGeneratedPixImage] = useState('');
    const [pixLoading, setPixLoading] = useState(false);

    // --- Effects ---
    useEffect(() => {
        const stored = localStorage.getItem('redflix_admin_session');
        if (stored) {
            const { timestamp } = JSON.parse(stored);
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) setIsAuthenticated(true);
        }
        setAuthChecking(false);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
            setLoading(false);
        });
        return () => unsub();
    }, [isAuthenticated]);

    // --- Stats Calculation ---
    const stats = useMemo(() => {
        const approved = leads.filter(l => l.status === 'approved');
        const pending = leads.filter(l => l.status === 'pending');

        const totalRevenue = approved.reduce((acc, curr) => acc + parsePrice(curr.price), 0);
        const pendingValue = pending.reduce((acc, curr) => acc + parsePrice(curr.price), 0);

        // Best Selling Plan
        const planCounts: Record<string, number> = {};
        approved.forEach(l => { planCounts[l.plan] = (planCounts[l.plan] || 0) + 1; });
        const bestPlan = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0];

        return {
            revenue: totalRevenue,
            pendingVal: pendingValue,
            approvedCount: approved.length,
            pendingCount: pending.length,
            bestPlanName: bestPlan ? bestPlan[0] : 'Nenhum',
            bestPlanCount: bestPlan ? bestPlan[1] : 0
        };
    }, [leads]);

    const expiringLeads = useMemo(() => {
        return leads.filter(l => l.status === 'approved')
            .sort((a, b) => getDaysRemaining(a.createdAt, a.plan) - getDaysRemaining(b.createdAt, b.plan));
    }, [leads]);

    // --- Actions ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === SECRET_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('redflix_admin_session', JSON.stringify({ timestamp: Date.now() }));
        } else alert('Senha incorreta');
    };

    const handleLogout = () => {
        localStorage.removeItem('redflix_admin_session');
        setIsAuthenticated(false);
    };

    const handleDeleteAll = async () => {
        if (!confirm('TEM CERTEZA? ISSO APAGA TUDO!')) return;
        try {
            const batch = writeBatch(db); // Simple batch
            leads.forEach(l => batch.delete(doc(db, "leads", l.id)));
            await batch.commit();
            alert('Limpeza concluída.');
        } catch (e) { alert('Erro ao limpar.'); }
    };

    const handleGeneratePix = async () => {
        if (!pixAmount) return alert('Digite o valor.');
        setPixLoading(true);
        try {
            const res = await axios.post('/api/payment', {
                amount: pixAmount,
                description: `Cobrança Manual - ${pixName}`,
                payerEmail: 'admin@redflix.com'
            });
            setGeneratedPixString(res.data.qrcode_content);
            setGeneratedPixImage(res.data.qrcode_image_url);
        } catch (e) { alert('Erro ao gerar Pix.'); }
        finally { setPixLoading(false); }
    };

    const generateRenewalLink = (type: 'renew' | 'upgrade3' | 'upgrade6') => {
        if (!selectedRenewal) return '';
        let base = type === 'renew' ? 29.90 : type === 'upgrade3' ? 79.90 : 149.90;
        let plan = type === 'renew' ? 'Mensal' : type === 'upgrade3' ? 'Trimestral' : 'Semestral';
        let price = (base * (1 - discount / 100)).toFixed(2).replace('.', ',');

        let msg = `Olá! Seu plano vence em breve. Renove agora com desconto: https://redflix.com/checkout/simple?plan=${plan}&price=${price}&leadId=${selectedRenewal.id}`;
        return `https://wa.me/${selectedRenewal.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    };

    if (authChecking) return null;

    if (!isAuthenticated) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0a0a0a] border border-red-900/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                <h1 className="text-3xl font-black italic text-center text-white mb-8">ADMIN <span className="text-red-600">REDFLIX</span></h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="password" placeholder="SENHA" className="w-full bg-black border border-white/10 p-4 rounded-xl text-center text-white tracking-[0.5em] focus:border-red-600 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)]">ACESSAR PAINEL</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020202] text-white flex font-sans overflow-hidden">
            {/* Sidebar Desktop */}
            <motion.aside initial={false} animate={{ width: sidebarCollapsed ? '80px' : '260px' }} className="hidden md:flex flex-col border-r border-white/5 bg-[#050505] z-50">
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-4 flex justify-center hover:bg-white/5"><Menu size={20} /></button>
                <nav className="flex-1 p-2 space-y-2">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
                        { id: 'pix', icon: QrCode, label: 'Gerador Pix' },
                        { id: 'renewals', icon: Clock, label: 'Renovações' },
                        { id: 'remarketing', icon: RefreshCw, label: 'Remarketing' },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:bg-white/5'}`}>
                            <item.icon size={20} className="shrink-0" />
                            {!sidebarCollapsed && <span className="text-xs font-bold uppercase">{item.label}</span>}
                        </button>
                    ))}
                </nav>
                <button onClick={handleLogout} className="p-4 flex items-center gap-4 text-gray-500 hover:text-red-500"><LogOut size={20} /> {!sidebarCollapsed && <span className="text-xs font-bold uppercase">Sair</span>}</button>
            </motion.aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#050505]">
                    <span className="font-black italic text-red-600">REDFLIX</span>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button>
                </header>
                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 bg-[#050505] md:hidden p-6">
                            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4"><X /></button>
                            <nav className="mt-12 space-y-4">
                                {['dashboard', 'pix', 'renewals', 'remarketing'].map(t => (
                                    <button key={t} onClick={() => { setActiveTab(t as any); setSidebarOpen(false); }} className="block w-full text-left text-2xl font-black uppercase text-white py-4 border-b border-white/10">{t}</button>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                    {activeTab === 'dashboard' && (
                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* 4 RED CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.3)] border border-red-500/20 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={60} /></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80">Faturamento Total</h3>
                                    <p className="text-2xl md:text-3xl font-black italic mt-1">{formatCurrency(stats.revenue)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-red-900/30 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 text-red-600"><Clock size={60} /></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500">Vendas Pendentes</h3>
                                    <p className="text-2xl md:text-3xl font-black italic mt-1 text-white">{stats.pendingCount} <span className="text-xs text-gray-500 not-italic align-top">({formatCurrency(stats.pendingVal)})</span></p>
                                </div>
                                <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-green-900/30 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 text-green-600"><CheckCircle2 size={60} /></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-green-500">Vendas Aprovadas</h3>
                                    <p className="text-2xl md:text-3xl font-black italic mt-1 text-white">{stats.approvedCount}</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-900 to-black border border-red-800/30 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 text-red-500"><TrendingUp size={60} /></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400">Campeão de Vendas</h3>
                                    <p className="text-xl md:text-2xl font-black italic mt-1 text-white truncate">{stats.bestPlanName}</p>
                                    <p className="text-[10px] text-gray-400">{stats.bestPlanCount} unidades</p>
                                </div>
                            </div>

                            {/* Filters & Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-xl font-black italic">Transações Recentes</h2>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} type="text" placeholder="Buscar..." className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none" />
                                    </div>
                                    <button onClick={handleDeleteAll} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors text-[10px] font-black uppercase"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-2">
                                {leads.filter(l => l.email.includes(searchTerm)).map(lead => (
                                    <motion.div key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0f0f0f] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-red-500/30 transition-colors">
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <div className={`w-2 h-2 rounded-full ${lead.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                <h4 className="font-bold text-sm">{lead.email}</h4>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1">{lead.phone} • {lead.plan} • {formatCurrency(parsePrice(lead.price))}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-green-900/20 text-green-500 rounded-lg hover:bg-green-600 hover:text-white"><MessageCircle size={16} /></a>
                                            <button onClick={() => { setEditingLead(lead); setEditForm({ ...lead }); }} className="p-2 bg-blue-900/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white"><Edit2 size={16} /></button>
                                            <button onClick={() => { if (confirm('Excluir?')) deleteDoc(doc(db, "leads", lead.id)); }} className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 size={16} /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'pix' && (
                        <div className="max-w-2xl mx-auto text-center space-y-8">
                            <h2 className="text-3xl font-black italic">Gerador de Pix Manual</h2>
                            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-white/10 space-y-6">
                                <input value={pixAmount} onChange={e => setPixAmount(e.target.value)} type="text" placeholder="Valor (ex: 29.90)" className="w-full bg-black p-4 rounded-xl text-center text-2xl font-bold text-white mb-4 border border-white/10 focus:border-red-600 outline-none" />
                                <button onClick={handleGeneratePix} disabled={pixLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2">
                                    {pixLoading ? <Loader2 className="animate-spin" /> : <><QrCode /> GERAR COBRANÇA</>}
                                </button>
                                {generatedPixString && (
                                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        <img src={generatedPixImage} alt="QR" className="w-48 h-48 mx-auto rounded-xl border-4 border-white" />
                                        <div className="bg-black/50 p-4 rounded-xl break-all font-mono text-xs text-gray-400">{generatedPixString}</div>
                                        <button onClick={() => navigator.clipboard.writeText(generatedPixString)} className="flex items-center justify-center gap-2 text-red-500 hover:text-white mx-auto"><Copy /> Copiar Código</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'renewals' && (
                        <div className="max-w-7xl mx-auto space-y-6">
                            <h2 className="text-2xl font-black italic">Gestão de Renovações</h2>
                            <div className="grid gap-2">
                                {expiringLeads.map(lead => {
                                    const days = getDaysRemaining(lead.createdAt, lead.plan);
                                    return (
                                        <div key={lead.id} className="bg-[#0f0f0f] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold">{lead.email}</h4>
                                                <p className={`text-xs ${days < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>Vence em {days} dias ({lead.plan})</p>
                                            </div>
                                            <button onClick={() => setSelectedRenewal(lead)} className="px-4 py-2 bg-green-600/10 text-green-500 rounded-lg hover:bg-green-600 hover:text-white text-[10px] font-black uppercase">Enviar Proposta</button>
                                        </div>
                                    )
                                })}
                            </div>
                            {/* Renewal Modal */}
                            {selectedRenewal && (
                                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                                    <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-md border border-white/10 relative">
                                        <button onClick={() => setSelectedRenewal(null)} className="absolute top-4 right-4"><X /></button>
                                        <h3 className="text-xl font-black italic mb-6">Enviar Renovação via WhatsApp</h3>
                                        <div className="space-y-4">
                                            <label className="text-xs uppercase font-bold text-gray-500">Desconto Extra: {discount}%</label>
                                            <input type="range" min="0" max="30" step="5" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full accent-green-500" />
                                            <div className="grid gap-2">
                                                {['renew', 'upgrade3', 'upgrade6'].map(t => (
                                                    <a key={t} href={generateRenewalLink(t as any)} target="_blank" className="block w-full p-4 bg-white/5 hover:bg-green-600/20 rounded-xl border border-white/5 hover:border-green-500/50 transition-all text-center">
                                                        <span className="font-black uppercase text-xs text-white">Opção {t}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'remarketing' && (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <RefreshCw size={48} className="mb-4 text-red-600" />
                            <h2 className="text-xl font-black italic">Remarketing Automático</h2>
                            <p className="text-xs max-w-md mt-2">O sistema enviará mensagens automáticas para leads pendentes em breve.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {editingLead && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-md border border-white/10">
                        <div className="flex justify-between mb-4"><h3 className="font-black italic">Editar Lead</h3><button onClick={() => setEditingLead(null)}><X /></button></div>
                        <div className="space-y-3">
                            <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-black p-3 rounded-lg border border-white/10 text-sm" placeholder="Email" />
                            <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-black p-3 rounded-lg border border-white/10 text-sm" placeholder="WhatsApp" />
                            <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-black p-3 rounded-lg border border-white/10 text-sm"><option value="pending">Pendente</option><option value="approved">Aprovado</option></select>
                            <button onClick={async () => { await updateDoc(doc(db, "leads", editingLead.id), { ...editForm }); setEditingLead(null); alert('Salvo!'); }} className="w-full bg-green-600 text-white font-black py-3 rounded-xl uppercase hover:bg-green-700">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
