import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * Endpoint de sincronização manual
 * Use este endpoint para copiar dados de uma coleção para outra
 * ou para verificar o estado atual do banco
 */
export async function GET() {
    try {
        // Lista todas as coleções disponíveis
        const collections = await db.listCollections();
        const collectionNames = collections.map(col => col.id);

        // Busca dados de cada coleção
        const data: Record<string, any[]> = {};

        for (const collectionName of collectionNames) {
            const snapshot = await db.collection(collectionName).get();
            data[collectionName] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        return NextResponse.json({
            status: 'success',
            message: 'Dados sincronizados com sucesso',
            collections: collectionNames,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Erro ao sincronizar:', error);
        return NextResponse.json({
            status: 'error',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

/**
 * POST: Copia dados de uma coleção para outra
 * Body: { from: 'source_collection', to: 'target_collection' }
 */
export async function POST(request: Request) {
    try {
        const { from, to } = await request.json();

        if (!from || !to) {
            return NextResponse.json({
                status: 'error',
                error: 'Parâmetros "from" e "to" são obrigatórios'
            }, { status: 400 });
        }

        // Busca todos os documentos da coleção de origem
        const sourceSnapshot = await db.collection(from).get();

        if (sourceSnapshot.empty) {
            return NextResponse.json({
                status: 'warning',
                message: `Coleção "${from}" está vazia`,
                copied: 0
            });
        }

        // Copia cada documento para a coleção de destino
        const batch = db.batch();
        let count = 0;

        sourceSnapshot.docs.forEach(doc => {
            const targetRef = db.collection(to).doc(doc.id);
            batch.set(targetRef, doc.data());
            count++;
        });

        await batch.commit();

        return NextResponse.json({
            status: 'success',
            message: `${count} documentos copiados de "${from}" para "${to}"`,
            copied: count
        });
    } catch (error: any) {
        console.error('Erro ao copiar dados:', error);
        return NextResponse.json({
            status: 'error',
            error: error.message
        }, { status: 500 });
    }
}
