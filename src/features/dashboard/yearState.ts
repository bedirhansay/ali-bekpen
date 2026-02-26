import { useSearchParams } from 'react-router-dom';

export function useYearState() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentYear = new Date().getFullYear();

    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : currentYear;

    const setYear = (newYear: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('year', newYear.toString());
            return next;
        });
    };

    return { year, setYear, currentYear };
}
