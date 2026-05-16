declare global {
  interface ImportMetaEnv {
    VITE_API_URL?: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const api = {
  get: async <T>(url: string, queryParams?: Record<string, string>): Promise<ApiResponse<T>> => {
    let fullUrl = url;
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      fullUrl = `${fullUrl}?${params}`;
    }
    
    const response = await fetch(fullUrl);
    const result = await response.json();
    return result;
  },

  post: async <T>(url: string, data: Record<string, any>): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  },

  put: async <T>(url: string, data: Record<string, any>): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  },

  patch: async <T>(url: string, data: Record<string, any>): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    const result = await response.json();
    return result;
  },
};

export default api;