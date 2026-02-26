import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seedCategoriesIfEmpty, createCategory, updateCategory, deleteCategory, forceSeedCategories } from './api';
import { ICategory, CategoryType, CreateCategoryDTO } from './types';
import { toast } from 'react-hot-toast';

export const CATEGORIES_QUERY_KEY = ['categories'];

export const useCategories = () => {
    return useQuery<ICategory[], Error>({
        queryKey: CATEGORIES_QUERY_KEY,
        queryFn: seedCategoriesIfEmpty,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCategoriesByType = (type?: CategoryType | "ALL") => {
    const { data: categories, ...rest } = useCategories();

    const filtered = categories?.filter((cat) => {
        if (!type || type === "ALL") return true;
        return cat.type === type;
    });

    return { categories: filtered, ...rest };
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
            toast.success('Kategori oluşturuldu');
        },
        onError: (error: any) => {
            toast.error('Kategori oluşturulamadı: ' + error.message);
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryDTO> }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
            toast.success('Kategori güncellendi');
        },
        onError: (error: any) => {
            toast.error('Kategori güncellenemedi: ' + error.message);
        }
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
            toast.success('Kategori silindi');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Kategori silinemedi');
        }
    });
};

export const useResetCategories = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: forceSeedCategories,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
            toast.success('Varsayılan kategoriler geri yüklendi');
        },
        onError: (error: any) => {
            toast.error('Geri yükleme başarısız: ' + error.message);
        }
    });
};
