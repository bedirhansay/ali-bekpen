import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getAggregateFromServer,
    getCountFromServer,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    startAfter,
    updateDoc,
    count,
    sum,
    average,
    type DocumentData,
    type DocumentSnapshot,
    type FirestoreDataConverter,
    type QueryConstraint,
    type Transaction,
} from 'firebase/firestore';
import { db } from './firebase-config';

/* ----------------------------- COLLECTION NAMES ----------------------------- */
export const COLLECTIONS = {
    VEHICLES: 'vehicles',
    TRANSACTIONS: 'transactions',
    EXCHANGE_RATES: 'exchangeRates',
} as const;

/* ----------------------------- BASE TYPES ----------------------------- */
export interface BaseDoc {
    id: string;
    createdAt: any;
    updatedAt: any;
}

/* ----------------------------- CONVERTER HELPER ----------------------------- */
export const createConverter = <T extends BaseDoc>(): FirestoreDataConverter<T> => ({
    toFirestore: (data: T): DocumentData => {
        const { id, ...rest } = data;
        return rest;
    },
    fromFirestore: (snap, _opt): T => ({
        ...(snap.data() as T),
        id: snap.id,
    }),
});

export const getTypedCollection = <T extends BaseDoc>(name: string) =>
    collection(db, name).withConverter(createConverter<T>());

export const getTypedDoc = <T extends BaseDoc>(name: string, id: string) =>
    doc(db, name, id).withConverter(createConverter<T>());

/* ----------------------------- CRUD OPERATIONS ----------------------------- */
export const createDocument = async <T extends BaseDoc>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
    try {
        const docRef = await addDoc(getTypedCollection<T>(collectionName), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        } as any);
        return docRef.id;
    } catch (err) {
        console.error(`❌ Firestore createDocument error: ${collectionName}`, err);
        throw err;
    }
};

export const getDocument = async <T extends BaseDoc>(collectionName: string, docId: string): Promise<T | null> => {
    try {
        const snap = await getDoc(getTypedDoc<T>(collectionName, docId));
        return snap.exists() ? snap.data() : null;
    } catch (err) {
        console.error(`❌ Firestore getDocument error: ${collectionName}/${docId}`, err);
        throw err;
    }
};

export const updateDocument = async <T extends BaseDoc>(
    collectionName: string,
    docId: string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
    try {
        await updateDoc(getTypedDoc<T>(collectionName, docId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (err) {
        console.error(`❌ Firestore updateDocument error: ${collectionName}/${docId}`, err);
        throw err;
    }
};

export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
    try {
        await deleteDoc(getTypedDoc(collectionName, docId));
    } catch (err) {
        console.error(`❌ Firestore deleteDocument error: ${collectionName}/${docId}`, err);
        throw err;
    }
};

/* ----------------------------- QUERY HELPERS ----------------------------- */
const ensureOrderBy = (constraints: QueryConstraint[], field = 'createdAt', direction: 'asc' | 'desc' = 'desc'): QueryConstraint[] => {
    const hasOrder = constraints.some((c: any) => c.type === 'orderBy');
    return hasOrder ? constraints : [orderBy(field, direction), ...constraints];
};

export const queryCollection = async <T extends BaseDoc>(
    collectionName: string,
    constraints: QueryConstraint[] = []
): Promise<T[]> => {
    try {
        const q = query(getTypedCollection<T>(collectionName), ...ensureOrderBy(constraints));
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data());
    } catch (err) {
        console.error(`❌ Firestore queryCollection error: ${collectionName}`, err);
        throw err;
    }
};

/* ----------------------------- PAGINATION ----------------------------- */
export interface PaginationParams {
    pageSize?: number;
    cursor?: DocumentSnapshot | null;
}

export const queryWithPagination = async <T extends BaseDoc>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    pagination: PaginationParams = {},
    orderByField = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc'
): Promise<{ items: T[]; nextCursor: DocumentSnapshot | null; hasMore: boolean }> => {
    try {
        const { pageSize = 10, cursor } = pagination;
        const base = ensureOrderBy(constraints, orderByField, orderDirection);
        const cs = [...base];

        if (cursor) cs.push(startAfter(cursor));
        cs.push(limit(pageSize + 1));

        const q = query(getTypedCollection<T>(collectionName), ...cs);
        const snap = await getDocs(q);

        const items = snap.docs.slice(0, pageSize).map((d) => d.data());
        const hasMore = snap.docs.length > pageSize;
        const nextCursor = hasMore ? snap.docs[pageSize - 1] : null;

        return { items, nextCursor, hasMore };
    } catch (err) {
        console.error(`❌ Firestore pagination error: ${collectionName}`, err);
        throw err;
    }
};

/* ----------------------------- AGGREGATION HELPERS ----------------------------- */
export const aggregateCollection = async <T extends BaseDoc>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    aggregations: {
        count?: boolean;
        sum?: string;
        average?: string;
    } = {}
): Promise<{
    count?: number;
    sum?: number;
    average?: number;
}> => {
    try {
        const q = query(getTypedCollection<T>(collectionName), ...constraints);
        const aggFns: any = {};

        if (aggregations.count) aggFns.count = count();
        if (aggregations.sum) aggFns.sum = sum(aggregations.sum);
        if (aggregations.average) aggFns.average = average(aggregations.average);

        if (Object.keys(aggFns).length === 0) {
            const res = await getCountFromServer(q);
            return { count: res.data().count };
        }

        const res = await getAggregateFromServer(q, aggFns);
        const data = res.data();

        return {
            count: data.count as number,
            sum: data.sum as number,
            average: data.average as number,
        };
    } catch (err) {
        console.error(`❌ Firestore aggregateCollection error: ${collectionName}`, err);
        throw err;
    }
};

export { runTransaction, serverTimestamp, type DocumentSnapshot, type QueryConstraint, type Transaction };
