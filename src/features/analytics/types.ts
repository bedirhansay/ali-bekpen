import { TransactionType } from '../transactions/types';

export interface AnalyticsFilters {
    year: number;
    month?: number; // 0-11
    type: TransactionType | 'ALL';
    vehicleId?: string;
}

export interface CategoryAnalyticItem {
    id: string;
    name: string;
    total: number;
    color: string;
    type: TransactionType;
    percentage: number;
}

export interface VehicleAnalyticItem {
    vehicleId: string;
    vehicleName: string;
    vehiclePlate: string;
    totalIncome: number;
    totalExpense: number;
    net: number;
}

export interface AnalyticsData {
    categories: CategoryAnalyticItem[];
    vehicles: VehicleAnalyticItem[];
}
