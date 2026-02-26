import { Timestamp } from 'firebase/firestore';

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  insuranceExpiryDate: Timestamp;
  inspectionExpiryDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateVehicleDTO = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVehicleDTO = Partial<CreateVehicleDTO>;
