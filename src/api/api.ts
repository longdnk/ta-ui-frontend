import { axiosClient } from "./client";

export const appApi = {
    get: async (url: string, params?: { plantId?: string | null }) => {
        return await axiosClient.get(url, { params: params });
    },
    post: async (url: string, data: unknown) => {
        return await axiosClient.post(url, data);
    },
    delete: async (url: string) => {
        return await axiosClient.delete(url);
    }
}