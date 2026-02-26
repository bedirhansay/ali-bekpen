import { useQuery } from '@tanstack/react-query';
import { getVehiclesList } from './api';

export const useVehicles = () => {
    return useQuery({
        queryKey: ['vehicles', 'list'],
        queryFn: () => getVehiclesList()
    });
};
