import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('authToken')
          : null;
        if (token) {
          config.headers.Authorization = \Bearer \\;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async get<T>(url: string) {
    return this.axiosInstance.get<T>(url);
  }

  async post<T>(url: string, data: any) {
    return this.axiosInstance.post<T>(url, data);
  }

  async put<T>(url: string, data: any) {
    return this.axiosInstance.put<T>(url, data);
  }

  async delete<T>(url: string) {
    return this.axiosInstance.delete<T>(url);
  }
}

export const apiClient = new ApiClient();
