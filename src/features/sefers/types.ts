import { Timestamp } from 'firebase/firestore';

export type SeferStatus = 'OPEN' | 'CLOSED';

export interface Sefer {
    id: string;
    vehicleId: string;
    title: string;
    description?: string;
    startDate: Timestamp;
    endDate?: Timestamp | null;
    status: SeferStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type CreateSeferDTO = Omit<Sefer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSeferDTO = Partial<CreateSeferDTO>;

/** Frontend-computed summary attached to each Sefer card */
export interface SeferSummary {
    totalIncomeTRY: number;
    totalExpenseTRY: number;
    netTRY: number;
}
