import { collection, getDocs, setDoc, doc, deleteDoc, Timestamp, query, where, limit, updateDoc } from 'firebase/firestore';
import { db } from '../../shared/utils/firebase-config';
import { ICategory, CreateCategoryDTO } from './types';

const CATEGORIES_COLLECTION = 'categories';
const TRANSACTIONS_COLLECTION = 'transactions';

const DEFAULT_CATEGORIES: CreateCategoryDTO[] = [
    // Income
    { name: 'Navlun', type: 'INCOME', color: '#0EA5E9', icon: 'Ship', isSystem: true },

    // Expense
    { name: 'Harcırah', type: 'EXPENSE', color: '#B91C1C', icon: 'Wallet', isSystem: true },
    { name: 'Maaş', type: 'EXPENSE', color: '#7F1D1D', icon: 'Users' },
    { name: 'Yakıt', type: 'EXPENSE', color: '#F87171', icon: 'Fuel' },
    { name: 'Servis', type: 'EXPENSE', color: '#EF4444', icon: 'Tool' },
    { name: 'Bakım', type: 'EXPENSE', color: '#DC2626', icon: 'Hammer' },
    { name: 'Lastik', type: 'EXPENSE', color: '#B91C1C', icon: 'Disc' },
    { name: 'Sigorta', type: 'EXPENSE', color: '#FCA5A5', icon: 'ShieldCheck' },
    { name: 'Vergi', type: 'EXPENSE', color: '#EF4444', icon: 'FileText' },
    { name: 'Otopark', type: 'EXPENSE', color: '#F87171', icon: 'ParkingCircle' },
    { name: 'Ceza', type: 'EXPENSE', color: '#DC2626', icon: 'AlertTriangle' },
    { name: 'Muayene', type: 'EXPENSE', color: '#B91C1C', icon: 'Search' },
];

export const fetchCategories = async (): Promise<ICategory[]> => {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const categories: ICategory[] = [];

    querySnapshot.forEach((docSnap) => {
        categories.push({ id: docSnap.id, ...docSnap.data() } as ICategory);
    });

    return categories.sort((a, b) => a.name.localeCompare(b.name));
};

export const createCategory = async (data: CreateCategoryDTO): Promise<ICategory> => {
    const docRef = doc(collection(db, CATEGORIES_COLLECTION));
    const newCategory = {
        ...data,
        createdAt: Timestamp.now()
    };
    await setDoc(docRef, newCategory);
    return { id: docRef.id, ...newCategory } as ICategory;
};

export const updateCategory = async (id: string, data: Partial<CreateCategoryDTO>): Promise<void> => {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, data);
};

export const deleteCategory = async (id: string): Promise<void> => {
    // 1. Check if used in transactions
    const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('categoryId', '==', id),
        limit(1)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        throw new Error('Bu kategori kullanımda olduğu için silinemez.');
    }

    // 2. Delete
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
};

export const seedCategoriesIfEmpty = async (): Promise<ICategory[]> => {
    const existingCategories = await fetchCategories();

    const hasNavlun = existingCategories.some(c => c.name === 'Navlun');
    const hasHarcirah = existingCategories.some(c => c.name === 'Harcırah');

    if (existingCategories.length === 0 || !hasNavlun || !hasHarcirah) {
        return forceSeedCategories();
    }

    return existingCategories;
};

export const forceSeedCategories = async (): Promise<ICategory[]> => {
    const existingSnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const deletePromises = existingSnapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const newCategories: ICategory[] = [];

    for (const cat of DEFAULT_CATEGORIES) {
        const docRef = doc(collection(db, CATEGORIES_COLLECTION));
        const newCategory = {
            ...cat,
            createdAt: Timestamp.now()
        };
        await setDoc(docRef, newCategory);
        newCategories.push({ id: docRef.id, ...newCategory } as ICategory);
    }

    return newCategories;
};
