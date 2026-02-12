'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
    return (
        <section className="relative w-full min-h-[600px] md:h-screen text-white overflow-x-clip md:overflow-hidden flex flex-col justify-center">
            {/* Desktop Background Image - Hidden on Mobile */}
            <div className="absolute inset-0 items-center justify-end hidden md:flex">
                <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-[50%] h-[70%] bg-primary/25 blur-[100px] rounded-full"></div>
                <div className="relative w-[70%] h-full">
                    <Image
                        src="https://i.imgur.com/wGZdjw3.png"
                        alt="RedFlix Background"
                        fill
                        className="object-cover object-left"
                        priority
                        sizes="70vw"
                    />
                </div>
            </div>

            {/* Gradients */}
            <div className="absolute inset-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent hidden md:block" />
            <div className="absolute inset-0 bottom-0 bg-gradient-to-r from-[#1a0000] via-[#0a0000]/90 to-transparent hidden md:block" />

            {/* Mobile Atmosphere */}
            <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[200%] h-[800px] bg-primary/15 blur-[140px] rounded-full z-0 md:hidden pointer-events-none"></div>

            <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col justify-start md:justify-center text-center md:text-left pt-32 pb-20 md:py-0">
                <div className="max-w-2xl mx-auto md:mx-0 flex flex-col items-center md:items-start">

                    {/* Headline Animada */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-20 text-[28px] md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1] font-[family-name:var(--font-inter)]"
                    >
                        Cansado de <span className="text-primary uppercase font-black tracking-tight whitespace-nowrap drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]">pagar caro</span><br />
                        por{' '}
                        <span className="relative inline-block px-1 whitespace-nowrap">
                            catálogos
                            <span className="absolute bottom-1 left-0 right-0 h-[4px] md:h-[6px] bg-primary rounded-full -z-10 opacity-80"></span>
                        </span>{' '}
                        <span className="relative inline-block px-1 whitespace-nowrap">
                            limitados?
                            <span className="absolute bottom-1 left-0 right-0 h-[4px] md:h-[6px] bg-primary rounded-full -z-10 opacity-80"></span>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative z-20 mt-6 text-[13px] md:text-lg text-gray-300 max-w-md mx-auto md:mx-0 leading-relaxed"
                    >
                        Pare de pagar e depois pagar novamente, para depois nem ter o filme que você queria.
                    </motion.p>

                    {/* Mobile Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="relative z-10 w-[calc(100%+3rem)] -mx-6 h-[260px] -mt-10 mb-4 md:hidden"
                    >
                        <div className="absolute -top-[40%] left-1/2 -translate-x-1/2 w-[120%] h-full bg-primary/50 blur-[90px] rounded-full z-10 pointer-events-none"></div>
                        <div className="relative w-full h-full" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)' }}>
                            <Image
                                src="https://i.imgur.com/wGZdjw3.png"
                                alt="RedFlix Mobile"
                                fill
                                className="object-contain scale-110"
                                priority
                                sizes="100vw"
                            />
                        </div>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-2 md:mt-8 w-full md:w-auto"
                    >
                        <Link href="#pricing" className="w-full md:w-auto block">
                            <button className="relative w-full md:w-auto bg-primary hover:bg-[#f40612] text-white font-bold text-base md:text-lg px-8 py-4 rounded-full inline-flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 group overflow-hidden shadow-[0_0_40px_rgba(229,9,20,0.6)] border border-white/10">
                                <span className="relative z-10">Assine agora e economize</span>
                                <ArrowRight className="relative z-10 transition-transform group-hover:translate-x-1" size={18} />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Down Indicator (Isca) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 cursor-pointer z-20"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Role para ver</span>
                <ChevronDown className="text-primary w-6 h-6 animate-bounce" />
            </motion.div>
        </section>
    );
};

export default Hero;
