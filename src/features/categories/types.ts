import { Timestamp } from 'firebase/firestore';
import { TransactionType } from '../transactions/types';

export type CategoryType = TransactionType;

export interface ICategory {
    id: string;
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
    isSystem?: boolean;
    createdAt: Timestamp;
}

export type CreateCategoryDTO = Omit<ICategory, 'id' | 'createdAt'>;
