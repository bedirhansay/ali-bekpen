import {
    COLLECTIONS,
    createDocument,
    deleteDocument,
    getDocument,
    queryWithPagination,
    updateDocument,
    type PaginationParams,
} from '@/shared/utils/firebase';
import { orderBy, type QueryConstraint } from 'firebase/firestore';
import { CreateVehicleDTO, UpdateVehicleDTO, Vehicle } from '../types';

export const getVehicles = async (pagination: PaginationParams) => {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    return queryWithPagination<Vehicle>(COLLECTIONS.VEHICLES, constraints, pagination);
};

export const getVehicle = async (id: string) => {
    return getDocument<Vehicle>(COLLECTIONS.VEHICLES, id);
};

export const createVehicle = async (data: CreateVehicleDTO) => {
    return createDocument<Vehicle>(COLLECTIONS.VEHICLES, data);
};

export const updateVehicle = async (id: string, data: UpdateVehicleDTO) => {
    return updateDocument<Vehicle>(COLLECTIONS.VEHICLES, id, data);
};

export const deleteVehicle = async (id: string) => {
    return deleteDocument(COLLECTIONS.VEHICLES, id);
};
