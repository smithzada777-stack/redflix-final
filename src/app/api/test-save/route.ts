import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function GET() {
    try {
        const testId = 'test_' + Date.now();

        console.log('🧪 Testing Firestore save with ID:', testId);

        // Test save to sales
        await db.collection('sales').doc(testId).set({
            amount: 99.99,
            email: 'test@redflix.com',
            whatsapp: '5511999999999',
            planName: 'Test Plan',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            pixId: testId,
            qrCode: 'test_qr',
            copyPaste: 'test_copy'
        });

        console.log('✅ Test document saved successfully');

        // Try to read it back
        const doc = await db.collection('sales').doc(testId).get();

        if (doc.exists) {
            console.log('✅ Test document read successfully:', doc.data());
            return NextResponse.json({
                success: true,
                message: 'Firestore is working!',
                data: doc.data()
            });
        } else {
            console.log('❌ Test document not found after save');
            return NextResponse.json({
                success: false,
                message: 'Document saved but not found'
            });
        }

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
