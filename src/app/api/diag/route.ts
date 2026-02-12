import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
    try {
        console.log('--- DIAGNÓSTICO DE BANCO INICIADO ---');

        // Testa conexão básica
        const testSnap = await db.collection('payments').limit(1).get();
        const connectionOk = !db.isMock;

        // Busca os últimos 10 registros de cada coleção
        const [payments, sales, leads] = await Promise.all([
            db.collection('payments').orderBy('createdAt', 'desc').limit(10).get(),
            db.collection('sales').orderBy('createdAt', 'desc').limit(10).get(),
            db.collection('leads').orderBy('createdAt', 'desc').limit(10).get()
        ]);

        const format = (snap: any) => snap.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            _createdAt_type: typeof doc.data().createdAt,
            _timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : 'no-date'
        }));

        return NextResponse.json({
            status: 'success',
            firebase_connected: connectionOk,
            project_id: process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id : 'not-found',
            data: {
                payments: format(payments),
                sales: format(sales),
                leads: format(leads)
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
