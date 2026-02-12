'use client';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/5571991644164?text=Oi%2C%20quero%20assinar%20o%20RedFlix%21"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[9999] group"
        >
            {/* Balão de CTA - Ao lado esquerdo no Desktop, arredondado */}
            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 w-48 opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto">
                <div className="bg-white text-black px-5 py-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.4)] font-bold text-sm text-center relative border border-gray-100 flex items-center justify-center transform hover:scale-105 transition-transform">
                    Fale com a gente!
                    {/* Seta do balão apontando para a direita */}
                    <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-white transform rotate-45 border-t border-r border-gray-100"></div>
                </div>
            </div>

            {/* Botão Vermelho Pulsante */}
            <div className="bg-[#E50914] hover:bg-[#ff0a16] text-white p-4 rounded-full shadow-[0_0_25px_rgba(229,9,20,0.6)] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center animate-pulse border-2 border-white/20">
                <MessageCircle size={32} strokeWidth={2.5} />
            </div>
        </a>
    );
}
