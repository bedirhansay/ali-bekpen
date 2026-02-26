import { toast } from 'react-hot-toast';

export const showSuccess = (message: string, options?: any) => {
    return toast.success(message, options);
};

export const showError = (error: any, options?: any) => {
    const message = error?.message || (typeof error === 'string' ? error : "Bir hata oluştu");
    return toast.error(message, options);
};

export const showLoading = (message: string = "Kaydediliyor...") => {
    return toast.loading(message);
};
