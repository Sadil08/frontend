export interface AnalyticsOverview {
    totalUsers: number;
    activeUsersToday: number;
    activeUsersThisMonth: number;
    totalRevenue: number;
    revenueToday: number;
    revenueThisMonth: number;
    totalExtractions: number;
    extractionsToday: number;
    totalBundlesSold: number;
    totalCountries: number;
}

export interface UserAnalytics {
    userId: number;
    username: string;
    email: string;
    country: string | null;
    registrationDate: string;
    lastLoginTime: string | null;
    totalBundlesPurchased: number;
    totalSpent: number;
    totalExtractions: number;
    totalPaperAttempts: number;
    averageScore: number | null;
}

export interface GeographicalStats {
    country: string;
    userCount: number;
    activeUsers: number;
    revenue: number;
    totalExtractions: number;
}

export interface DailyRevenue {
    date: string;
    revenue: number;
    transactions: number;
    uniqueUsers: number;
}

export interface ExtractionStats {
    totalExtractions: number;
    uniqueUsersWithExtractions: number;
    extractionsToday: number;
    extractionsByUser: Record<number, number>;
    usersHitLimit: number;
}

export interface BundlePerformance {
    bundleId: number;
    bundleName: string;
    totalPurchases: number;
    totalRevenue: number;
    averageCompletionRate: number | null;
    averageScore: number | null;
}

export interface DailyUserActivity {
    date: string;
    newRegistrations: number;
    activeUsers: number;
    totalLogins: number;
}

export interface AnalyticsFilter {
    country?: string;
    startDate?: string;
    endDate?: string;
    minSpending?: number;
    maxSpending?: number;
}
