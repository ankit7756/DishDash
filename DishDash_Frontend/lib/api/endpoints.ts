export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        PROFILE: '/api/auth/profile',
        UPDATE_PROFILE: '/api/auth/profile',
        REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,

        // MFA
        MFA_SETUP: '/api/auth/mfa/setup',
        MFA_CONFIRM: '/api/auth/mfa/confirm',
        MFA_VERIFY: '/api/auth/mfa/verify',
        MFA_DISABLE: '/api/auth/mfa/disable',

        // Password policy
        CHANGE_PASSWORD: '/api/auth/change-password',
        COMPLETE_PASSWORD_CHANGE: '/api/auth/complete-password-change',

        // Session management
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',

        // Privacy
        EXPORT_DATA: '/api/auth/export-data',
    },
    ADMIN: {
        USERS: {
            CREATE: '/api/admin/users',
            GET_ALL: '/api/admin/users',
            GET_ONE: (id: string) => `/api/admin/users/${id}`,
            UPDATE: (id: string) => `/api/admin/users/${id}`,
            DELETE: (id: string) => `/api/admin/users/${id}`,
        },
        RESTAURANTS: {
            GET_ALL: '/api/admin/restaurants',
            GET_ONE: (id: string) => `/api/admin/restaurants/${id}`,
            CREATE: '/api/admin/restaurants',
            UPDATE: (id: string) => `/api/admin/restaurants/${id}`,
            DELETE: (id: string) => `/api/admin/restaurants/${id}`,
        },
        FOODS: {
            GET_ALL: '/api/admin/foods',
            GET_ONE: (id: string) => `/api/admin/foods/${id}`,
            CREATE: '/api/admin/foods',
            UPDATE: (id: string) => `/api/admin/foods/${id}`,
            DELETE: (id: string) => `/api/admin/foods/${id}`,
        },
        ORDERS: {
            GET_ALL: '/api/admin/orders',
            UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
        },
        STATS: '/api/admin/stats',
        REVIEWS: '/api/admin/reviews',
        AUDIT_LOGS: '/api/admin/audit-logs',
    },
    FOODS: {
        GET_ALL: '/api/foods',
        GET_POPULAR: '/api/foods/popular',
        GET_BY_ID: (id: string) => `/api/foods/${id}`,
        GET_BY_RESTAURANT: (restaurantId: string) => `/api/foods/restaurant/${restaurantId}`,
    },
    RESTAURANTS: {
        GET_ALL: '/api/restaurants',
        GET_BY_ID: (id: string) => `/api/restaurants/${id}`,
        SEARCH: '/api/restaurants/search',
    },
    ORDERS: {
        CREATE: '/api/orders',
        GET_ALL: '/api/orders',
        CURRENT: '/api/orders/current',
        HISTORY: '/api/orders/history',
        GET_BY_ID: (id: string) => `/api/orders/${id}`,
        CONFIRM: (id: string) => `/api/orders/${id}/confirm`,
        CANCEL: (id: string) => `/api/orders/${id}/cancel`,
        UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
    },
    PAYMENT: {
        // Real Khalti ePayment — replaces the old fake email-OTP flow entirely.
        KHALTI_INITIATE: '/api/payment/khalti/initiate',
        KHALTI_VERIFY: '/api/payment/khalti/verify',
    },
    REVIEWS: {
        SUBMIT: (orderId: string) => `/api/reviews/order/${orderId}`,
        GET_BY_ORDER: (orderId: string) => `/api/reviews/order/${orderId}`,
        MY_REVIEWS: '/api/reviews/my',
        RESTAURANT: (restaurantId: string) => `/api/reviews/restaurant/${restaurantId}`,
    },
};