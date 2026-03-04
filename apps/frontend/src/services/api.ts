import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
        try {
            const { state } = JSON.parse(stored);
            if (state?.accessToken) {
                config.headers.Authorization = `Bearer ${state.accessToken}`;
            }
        } catch { }
    }
    return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const stored = localStorage.getItem('auth-storage');
            if (stored) {
                try {
                    const { state } = JSON.parse(stored);
                    if (state?.refreshToken) {
                        const response = await axios.post('/api/auth/refresh', { refreshToken: state.refreshToken });
                        const { accessToken, refreshToken } = response.data.data;
                        const newState = { ...state, accessToken, refreshToken };
                        localStorage.setItem('auth-storage', JSON.stringify({ state: newState }));
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                } catch {
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH ====================
export const authApi = {
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
    getMe: () => api.get('/auth/me'),
    changePassword: (data: any) => api.post('/auth/change-password', data),
};

// ==================== DISCIPLINES ====================
export const disciplineApi = {
    getAll: (params?: any) => api.get('/disciplines', { params }),
    getById: (id: string) => api.get(`/disciplines/${id}`),
    create: (data: any) => api.post('/disciplines', data),
    update: (id: string, data: any) => api.put(`/disciplines/${id}`, data),
    delete: (id: string) => api.delete(`/disciplines/${id}`),
};

// ==================== RESULTS ====================
export const resultApi = {
    getAll: (params?: any) => api.get('/results', { params }),
    getById: (id: string) => api.get(`/results/${id}`),
    create: (data: any) => api.post('/results', data),
    update: (id: string, data: any) => api.put(`/results/${id}`, data),
    delete: (id: string) => api.delete(`/results/${id}`),
    getPersonalBests: (userId: string) => api.get(`/results/user/${userId}/personal-bests`),
    export: (params?: any) => api.get('/results/export', { params, responseType: 'blob' }),
    import: (formData: FormData) => api.post('/results/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ==================== RECORDS ====================
export const recordApi = {
    getAll: (params?: any) => api.get('/records', { params }),
    getById: (id: string) => api.get(`/records/${id}`),
    getTop: (limit?: number) => api.get('/records/top', { params: { limit } }),
    getPending: () => api.get('/records/pending'),
    verify: (id: string, data: any) => api.put(`/records/${id}/verify`, data),
    getTimeline: (disciplineId: string, params?: any) => api.get(`/records/timeline/${disciplineId}`, { params }),
};

// ==================== USERS ====================
export const userApi = {
    getAll: (params?: any) => api.get('/users', { params }),
    getById: (id: string) => api.get(`/users/${id}`),
    update: (id: string, data: any) => api.put(`/users/${id}`, data),
    updateProfile: (data: any) => api.put('/users/profile', data),
    delete: (id: string) => api.delete(`/users/${id}`),
    getStatistics: (id: string) => api.get(`/users/${id}/statistics`),
    quickHistoricalEntry: (data: any) => api.post('/users/historical-entry', data),
    getPersonalBests: (userId: string) => api.get(`/results/user/${userId}/personal-bests`),
    getResults: (userId: string, params?: any) => api.get(`/results`, { params: { userId, ...params } }),
    getRecords: (userId: string) => api.get(`/records`, { params: { userId } }),
};

// ==================== STATISTICS ====================
export const statisticsApi = {
    getDashboard: () => api.get('/statistics/dashboard'),
    getDisciplineStats: (disciplineId: string) => api.get(`/statistics/discipline/${disciplineId}`),
    compareAthletes: (ids: string[], disciplineId?: string) => api.get('/statistics/compare', { params: { ids: ids.join(','), disciplineId } }),
    getFacultyRanking: () => api.get('/statistics/faculties'),
    facultyRanking: () => api.get('/statistics/faculties'),
    getAuditLogs: (params?: any) => api.get('/statistics/audit-logs', { params }),
    auditLog: (params?: any) => api.get('/statistics/audit-logs', { params }),
    getAthleteRanking: () => api.get('/statistics/athlete-ranking'),
    trends: (params: { disciplineId: string, gender?: string }) => api.get(`/statistics/discipline/${params.disciplineId}`, { params: { gender: params.gender } }),
};

// ==================== GAMES ====================
export const gamesApi = {
    getEditions: (params?: any) => api.get('/games', { params }),
    getEditionById: (id: string) => api.get(`/games/${id}`),
    createEdition: (data: any) => api.post('/games', data),
    updateStatus: (id: string, status: string) => api.put(`/games/${id}/status`, { status }),
    joinEdition: (id: string) => api.post(`/games/${id}/join`),
    submitResult: (data: any) => api.post('/games/results', data),
    getLeaderboard: (id: string, gender?: string) => api.get(`/games/${id}/leaderboard`, { params: { gender } }),
    verifyResult: (resultId: string, verified: boolean, note?: string) => api.put(`/games/results/${resultId}/verify`, { verified, note }),
};

// ==================== VIDEOS ====================
export const videoApi = {
    getAll: (params?: any) => api.get('/videos', { params }),
    getById: (id: string) => api.get(`/videos/${id}`),
    upload: (formData: FormData) => api.post('/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    review: (id: string, data: any) => api.put(`/videos/${id}/review`, data),
    delete: (id: string) => api.delete(`/videos/${id}`),
};

// Backward-compatible aliases for existing pages
export const disciplinesApi = disciplineApi;
export const resultsApi = resultApi;
export const recordsApi = recordApi;
export const usersApi = userApi;
export const videosApi = videoApi;

export default api;
