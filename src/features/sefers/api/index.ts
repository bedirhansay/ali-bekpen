import {
    COLLECTIONS,
    createDocument,
    deleteDocument,
    getDocument,
    updateDocument,
} from '@/shared/utils/firebase';

import { collection, where, orderBy, query, getDocs, type QueryConstraint } from 'firebase/firestore';
import { db } from '@/shared/utils/firebase-config';
import { CreateSeferDTO, Sefer, UpdateSeferDTO } from '../types';

/** Get all sefers for a vehicle, ordered by startDate desc */
export const getSefersByVehicle = async (vehicleId: string): Promise<Sefer[]> => {
    const constraints: QueryConstraint[] = [
        where('vehicleId', '==', vehicleId),
        orderBy('startDate', 'desc'),
    ];
    const q = query(collection(db, COLLECTIONS.SEFERS), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Sefer));
};

export const getSefer = async (id: string): Promise<Sefer | null> => {
    return getDocument<Sefer>(COLLECTIONS.SEFERS, id);
};

export const createSefer = async (data: CreateSeferDTO): Promise<string> => {
    return createDocument<Sefer>(COLLECTIONS.SEFERS, data);
};

export const updateSefer = async (id: string, data: UpdateSeferDTO): Promise<void> => {
    return updateDocument<Sefer>(COLLECTIONS.SEFERS, id, data);
};

export const deleteSefer = async (id: string): Promise<void> => {
    return deleteDocument(COLLECTIONS.SEFERS, id);
};
