import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';

export type VehicleStatus = 'safe' | 'warning' | 'danger' | 'expired';

export interface ExpiryStatus {
    remainingDays: number;
    status: VehicleStatus;
    color: string;
    label: string;
}

/**
 * Calculates remaining days and status for a given expiry date.
 */
export const getExpiryStatus = (expiryDate: Timestamp | Date | any): ExpiryStatus => {
    if (!expiryDate) {
        return { remainingDays: 0, status: 'expired', color: '#ef4444', label: 'Tarih Belirlenmedi' };
    }

    // Handle Firebase Timestamp
    const date = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
    const today = dayjs().startOf('day');
    const expiry = dayjs(date).startOf('day');

    const remainingDays = expiry.diff(today, 'day');

    if (remainingDays < 0) {
        return { remainingDays, status: 'expired', color: '#991b1b', label: 'Süresi Doldu' };
    }
    if (remainingDays <= 7) {
        return { remainingDays, status: 'danger', color: '#ef4444', label: `${remainingDays} gün kaldı` };
    }
    if (remainingDays <= 30) {
        return { remainingDays, status: 'warning', color: '#f97316', label: `${remainingDays} gün kaldı` };
    }

    return { remainingDays, status: 'safe', color: '#22c55e', label: `${remainingDays} gün kaldı` };
};
