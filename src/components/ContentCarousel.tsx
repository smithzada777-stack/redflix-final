'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

interface ContentItem {
    id: number;
    name: string;
    img: string;
    badge?: string;
}

interface CarouselProps {
    title: React.ReactNode;
    items: ContentItem[];
    delay?: number;
}

export default function ContentCarousel({ title, items, delay = 0 }: CarouselProps) {
    const [isPaused, setIsPaused] = useState(false);

    // Triple items for infinite scroll
    const displayItems = [...items, ...items, ...items];

    return (
        <section className="py-6 md:py-10 relative w-full overflow-hidden">
            {/* Title */}
            <h4 className="container mx-auto px-6 md:px-12 text-lg md:text-2xl font-black mb-6 md:mb-8 text-white uppercase tracking-wider italic drop-shadow-md">
                {title}
            </h4>

            <div
                className="relative w-full overflow-hidden group pt-4 pb-10"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Carousel Wrapper */}
                <div className="flex w-full">
                    <div
                        className={`flex gap-4 md:gap-5 px-4 animate-scroll ${isPaused ? 'pause-animation' : ''}`}
                        style={{
                            animationDuration: '25s', // Slower for better view
                            animationDelay: `${delay}s`
                        }}
                    >
                        {displayItems.map((item, idx) => (
                            <div
                                key={`${item.id}-${idx}`}
                                className="flex-none w-[150px] md:w-[200px] lg:w-[calc((100vw-12rem)/5.5)] group/card"
                            >
                                <div className="relative aspect-[2/3] rounded-xl bg-zinc-900 border-2 border-transparent transition-all duration-300 hover:scale-105 hover:z-50 hover:border-primary hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] cursor-pointer overflow-visible">

                                    {/* Badge Overlay */}
                                    {item.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 bg-primary text-white text-[10px] md:text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg whitespace-nowrap border-2 border-[#121212]">
                                            {item.badge}
                                        </div>
                                    )}

                                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                                        <Image
                                            src={item.img}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity" />
                                    </div>
                                </div>

                                <p className="mt-3 text-center text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wider truncate px-1 group-hover/card:text-white group-hover/card:text-primary transition-colors">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-scroll {
                    display: flex;
                    animation: scroll linear infinite;
                }
                .pause-animation {
                    animation-play-state: paused !important;
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
            `}</style>
        </section>
    );
}
