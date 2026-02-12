'use client';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/5571991644164?text=Oi%2C%20quero%20assinar%20o%20RedFlix%21"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group"
        >
            {/* Balão de CTA sempre visível no desktop, hover no mobile */}
            <div className="absolute bottom-full right-0 mb-3 w-40 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto">
                <div className="bg-white text-black px-4 py-2 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.3)] font-bold text-sm text-center relative border border-gray-200">
                    Fale com a gente!
                    <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-200"></div>
                </div>
            </div>

            {/* Botão Vermelho Pulsante */}
            <div className="bg-[#E50914] hover:bg-[#ff0a16] text-white p-4 rounded-full shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center animate-pulse">
                <MessageCircle size={32} strokeWidth={2.5} />
            </div>
        </a>
    );
}
