import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
    // Users
    getUsers: async () => {
        const response = await axios.get(`${API_URL}/admin/users`, { headers: getAuthHeader() });
        return response.data;
    },
    getUserDetails: async (id: number) => {
        const response = await axios.get(`${API_URL}/admin/users/${id}`, { headers: getAuthHeader() });
        return response.data;
    },

    // Subjects
    getSubjects: async () => {
        const response = await axios.get(`${API_URL}/subjects`, { headers: getAuthHeader() });
        return response.data;
    },
    createSubject: async (data: any) => {
        const response = await axios.post(`${API_URL}/subjects`, data, { headers: getAuthHeader() });
        return response.data;
    },
    updateSubject: async (id: number, data: any) => {
        const response = await axios.put(`${API_URL}/subjects/${id}`, data, { headers: getAuthHeader() });
        return response.data;
    },
    deleteSubject: async (id: number) => {
        await axios.delete(`${API_URL}/subjects/${id}`, { headers: getAuthHeader() });
    },

    // Lessons
    getLessons: async () => {
        const response = await axios.get(`${API_URL}/lessons`, { headers: getAuthHeader() });
        return response.data;
    },
    createLesson: async (data: any) => {
        const response = await axios.post(`${API_URL}/lessons`, data, { headers: getAuthHeader() });
        return response.data;
    },
    updateLesson: async (id: number, data: any) => {
        const response = await axios.put(`${API_URL}/lessons/${id}`, data, { headers: getAuthHeader() });
        return response.data;
    },
    deleteLesson: async (id: number) => {
        await axios.delete(`${API_URL}/lessons/${id}`, { headers: getAuthHeader() });
    },

    // Bundles
    createBundle: async (data: any) => {
        const response = await axios.post(`${API_URL}/paper-bundles`, data, { headers: getAuthHeader() });
        return response.data;
    },
    updateBundle: async (id: number, data: any) => {
        // Assuming PUT endpoint exists or similar
        // Spec only listed POST for create, but CRUD implies update
        // If not, we might need to handle differently. For now assuming standard REST.
        const response = await axios.put(`${API_URL}/paper-bundles/${id}`, data, { headers: getAuthHeader() });
        return response.data;
    },
    deleteBundle: async (id: number) => {
        // Spec check: DELETE /api/paper-bundles/{id} not explicitly listed in table but implied by "CRUD bundles"
        // If missing, this will fail. Assuming standard CRUD.
        await axios.delete(`${API_URL}/paper-bundles/${id}`, { headers: getAuthHeader() });
    },

    // Papers
    createPaper: async (data: any) => {
        const response = await axios.post(`${API_URL}/papers`, data, { headers: getAuthHeader() });
        return response.data;
    },
    updatePaper: async (id: number, data: any) => {
        const response = await axios.put(`${API_URL}/papers/${id}`, data, { headers: getAuthHeader() });
        return response.data;
    },
    deletePaper: async (id: number) => {
        await axios.delete(`${API_URL}/papers/${id}`, { headers: getAuthHeader() });
    },

    // Questions
    createQuestion: async (data: any) => {
        const response = await axios.post(`${API_URL}/questions`, data, { headers: getAuthHeader() });
        return response.data;
    },
    updateQuestion: async (id: number, data: any) => {
        const response = await axios.put(`${API_URL}/questions/${id}`, data, { headers: getAuthHeader() });
        return response.data;
    },
    deleteQuestion: async (id: number) => {
        await axios.delete(`${API_URL}/questions/${id}`, { headers: getAuthHeader() });
    },

    // Options
    createOption: async (data: any) => {
        const response = await axios.post(`${API_URL}/question-options`, data, { headers: getAuthHeader() });
        return response.data;
    },
    deleteOption: async (id: number) => {
        await axios.delete(`${API_URL}/question-options/${id}`, { headers: getAuthHeader() });
    }
};
