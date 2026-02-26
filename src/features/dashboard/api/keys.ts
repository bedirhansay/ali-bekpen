export const dashboardKeys = {
    all: ['dashboard'] as const,
    yearlySummary: (year: number) => [...dashboardKeys.all, 'yearlySummary', year] as const,
};
