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

const getApiBaseUrl = () => {
  const base = import.meta.env.VITE_API_URL;
  if (!base) return '';
  return base.replace(/\/$/, '');
};

const buildUrl = (url: string) => {
  if (!url.startsWith('/api')) return url;
  const base = getApiBaseUrl();
  if (!base) return url;
  return `${base}${url}`;
};

const requestJson = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options?: { data?: Record<string, any>; queryParams?: Record<string, string> }
): Promise<ApiResponse<T>> => {
  let fullUrl = buildUrl(url);
  if (options?.queryParams) {
    const params = new URLSearchParams(options.queryParams);
    fullUrl = `${fullUrl}?${params}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers: options?.data
      ? {
          'Content-Type': 'application/json',
        }
      : undefined,
    body: options?.data ? JSON.stringify(options.data) : undefined,
  });

  let result: any;
  try {
    result = await response.json();
  } catch {
    throw new Error(`响应解析失败(${response.status})`);
  }

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || `请求失败(${response.status})`);
  }

  return result as ApiResponse<T>;
};

const api = {
  get: async <T>(url: string, queryParams?: Record<string, string>): Promise<ApiResponse<T>> => {
    return requestJson<T>('GET', url, { queryParams });
  },

  post: async <T>(url: string, data: Record<string, any>): Promise<ApiResponse<T>> => {
    return requestJson<T>('POST', url, { data });
  },

  put: async <T>(url: string, data: Record<string, any>): Promise<ApiResponse<T>> => {
    return requestJson<T>('PUT', url, { data });
  },

  patch: async <T>(url: string, data: Record<string, any>): Promise<ApiResponse<T>> => {
    return requestJson<T>('PATCH', url, { data });
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    return requestJson<T>('DELETE', url);
  },
};

export default api;
