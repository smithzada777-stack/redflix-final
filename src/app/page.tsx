'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PriceComparison from '@/components/PriceComparison';
import ContentCarousel from '@/components/ContentCarousel';
import Testimonials from '@/components/Testimonials';
import Plans from '@/components/Plans';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BackToTop from '@/components/BackToTop';

const sportsItems = [
  { id: 1, name: 'Brasileirão', img: 'https://i.imgur.com/KzbghZn.png', badge: 'AO VIVO' },
  { id: 2, name: 'Copa do Mundo', img: 'https://i.imgur.com/oozXd3K.png', badge: 'EXCLUSIVO' },
  { id: 3, name: 'Copa do Nordeste', img: 'https://i.imgur.com/8JocDJp.png', badge: 'AO VIVO' },
  { id: 4, name: 'NBA', img: 'https://i.imgur.com/aVGJOG6.png', badge: 'FINAIS' },
  { id: 5, name: 'UFC', img: 'https://i.imgur.com/kCiNi9e.png', badge: 'COMBATE' },
  { id: 6, name: 'Premiere', img: 'https://i.imgur.com/rv4vxMN.png', badge: '24H' },
  { id: 7, name: 'CazéTV', img: 'https://i.imgur.com/JKR83pe.png', badge: 'ONLINE' },
  { id: 8, name: 'ESPN', img: 'https://i.imgur.com/U0Tr1Z7.png', badge: 'ESPORTES' },
  { id: 9, name: 'SPORTV', img: 'https://i.imgur.com/vIrkVYY.png', badge: 'AO VIVO' },
];

const moviesItems = [
  { id: 1, name: 'Avatar: Fogos e Cinzas', img: 'https://i.imgur.com/o5aFK6U.png', badge: 'ESTREIA' },
  { id: 2, name: 'Zootopia 2', img: 'https://i.imgur.com/ZNgNuQE.png', badge: 'NOVO' },
  { id: 3, name: 'Truque de Mestre 3', img: 'https://i.imgur.com/FAfqJZq.png', badge: 'EM BREVE' },
  { id: 4, name: 'Jurassic World: Rebirth', img: 'https://i.imgur.com/9TNCuaG.png', badge: '4K' },
  { id: 5, name: 'Minecraft Filme', img: 'https://i.imgur.com/36sJP7U.png', badge: 'KIDS' },
  { id: 6, name: 'Missão Impossível 8', img: 'https://i.imgur.com/D4DWCtR.png', badge: 'AÇÃO' },
  { id: 7, name: 'Bailarina (John Wick)', img: 'https://i.imgur.com/wDqFB1z.png', badge: 'TOP 10' },
  { id: 8, name: 'Mickey 17', img: 'https://i.imgur.com/XcHZOKv.png', badge: 'SCI-FI' },
  { id: 9, name: '28 Anos Depois', img: 'https://i.imgur.com/QSvAHgB.png', badge: 'TERROR' },
];

const seriesItems = [
  { id: 1, name: 'Stranger Things', img: 'https://i.imgur.com/4eIqVnR.png', badge: 'FINAL' },
  { id: 2, name: 'The Walking Dead', img: 'https://i.imgur.com/YbDnYHB.png', badge: 'COMPLETA' },
  { id: 3, name: 'Vikings', img: 'https://i.imgur.com/MJIgYFX.png', badge: 'ÉPICO' },
  { id: 4, name: 'Game of Thrones', img: 'https://i.imgur.com/7Y4BgjE.png', badge: 'TOP 1' },
  { id: 5, name: 'Breaking Bad', img: 'https://i.imgur.com/PJy6JUu.png', badge: 'IMPERDÍVEL' },
  { id: 6, name: 'La Casa de Papel', img: 'https://i.imgur.com/T16gYjr.png', badge: 'TOP BR' },
  { id: 7, name: 'The Boys', img: 'https://i.imgur.com/A2gXG5T.png', badge: 'NOVA TEMP' },
  { id: 8, name: 'Peaky Blinders', img: 'https://i.imgur.com/sGgQcrT.png', badge: 'CLÁSSICO' },
  { id: 9, name: 'Black Mirror', img: 'https://i.imgur.com/9g7RPOv.png', badge: 'VIRAL' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <Navbar />
      <Hero />
      <PriceComparison />

      <section className="py-16 bg-black">
        <div className="container mx-auto px-4 md:px-12 mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            Na <span className="text-primary">REDFLIX</span>, você tem acesso a:
          </h2>
        </div>

        <div className="space-y-4">
          <ContentCarousel title={<>Jogos ao vivo e <span className="text-primary">MUITO MAIS</span>:</>} items={sportsItems} delay={0} />
          <ContentCarousel title={<>Principais <span className="text-primary">FILMES</span>:</>} items={moviesItems} delay={2} />
          <ContentCarousel title={<>Melhores <span className="text-primary">SÉRIES</span>:</>} items={seriesItems} delay={4} />
        </div>
      </section>

      <Testimonials />
      <Plans />
      <FAQ />
      <Footer />

      <WhatsAppButton />
      <BackToTop />
    </main>
  );
}
