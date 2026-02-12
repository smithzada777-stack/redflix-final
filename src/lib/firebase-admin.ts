import * as admin from 'firebase-admin';

let dbInstance: any;

try {
    if (!admin.apps.length) {
        let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountStr) {
            const serviceAccount = JSON.parse(serviceAccountStr);

            if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin: Conectado com sucesso ao projeto', serviceAccount.project_id);
            dbInstance = admin.firestore();
        } else {
            throw new Error("Variável FIREBASE_SERVICE_ACCOUNT não encontrada.");
        }
    } else {
        dbInstance = admin.firestore();
    }
} catch (error: any) {
    console.error('❌ ERRO FATAL FIREBASE ADMIN:', error.message);
    // Fallback mínimo apenas para o build não quebrar
    dbInstance = {
        collection: (name: string) => ({
            doc: () => ({
                set: async () => { throw new Error('Firebase não inicializado corretamente'); },
                update: async () => { throw new Error('Firebase não inicializado corretamente'); },
                get: async () => ({ exists: false }),
            }),
            where: () => dbInstance.collection(name),
            orderBy: () => dbInstance.collection(name),
            get: async () => ({ docs: [] })
        })
    };
}

export const db = dbInstance;
