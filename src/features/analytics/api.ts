import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/utils/firebase-config';
import { COLLECTIONS } from '@/shared/utils/firebase';
import { Transaction } from '../transactions/types';
import { AnalyticsFilters } from './types';
import { toast } from 'react-hot-toast';

export const getFilteredTransactions = async (filters: AnalyticsFilters) => {
    try {
        const { year, month, type, vehicleId } = filters;

        let startDate: Date;
        let endDate: Date;

        if (month !== undefined && month !== null) {
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        } else {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        }

        const constraints = [
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate)),
        ];

        if (vehicleId) {
            constraints.push(where('vehicleId', '==', vehicleId));
        }

        if (type && type !== 'ALL') {
            constraints.push(where('type', '==', type));
        }

        // IMPORTANT: Range filters require the same field in orderBy as the first orderBy
        const q = query(
            collection(db, COLLECTIONS.TRANSACTIONS),
            ...constraints,
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
    } catch (error: any) {
        console.error("DEBUG: Analytics API Error:", error);
        if (error.code === 'failed-precondition') {
            toast.error("Firestore indeksi eksik. Lütfen konsoldaki linke tıklayarak indeksi oluşturun.");
        } else {
            toast.error("Veriler alınırken bir hata oluştu: " + error.message);
        }
        return [];
    }
};
