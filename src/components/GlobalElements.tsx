'use client';

import { usePathname } from 'next/navigation';
import ScrollProgressBar from './ui/ScrollProgressBar';
import WhatsAppButton from './WhatsAppButton';

export default function GlobalElements() {
    const pathname = usePathname();

    // Lista de rotas onde NÃO deve aparecer (Dashboard e Admin)
    const isDashboard = pathname?.includes('/dashred') || pathname?.includes('/admin') || pathname?.includes('/login');

    if (isDashboard) {
        return null;
    }

    return (
        <>
            <ScrollProgressBar />
            <WhatsAppButton />
        </>
    );
}
