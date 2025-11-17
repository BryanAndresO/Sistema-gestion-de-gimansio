import { useState, useEffect, useCallback } from 'react';
import axios from '../services/core/axiosConfig';
import { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ErrorResponse {
  message?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  skip?: boolean;
}

export const useApi = <T = unknown>(
  url: string,
  options: RequestConfig = {}
) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { skip = false, method, headers, params, data } = options;

  const fetchData = useCallback(async (isCancelled: { value: boolean }) => {
    if (isCancelled.value) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios({
        method: method || 'GET',
        url: url.startsWith('/') ? url : `/${url}`,
        headers,
        params,
        data,
        withCredentials: true,
      });

      if (isCancelled.value) return;

      console.log('API Response:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));

      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (isCancelled.value) return;

      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Error desconocido';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [url, method, headers, params, data]);

  useEffect(() => {
    if (skip) return;

    const isCancelled = { value: false };
    fetchData(isCancelled);

    return () => {
      isCancelled.value = true;
    };
  }, [skip, fetchData]);

  const refetch = useCallback(() => {
    fetchData({ value: false });
  }, [fetchData]);

  return { ...state, refetch };
};

export const useApiMutation = <T = unknown, D = unknown>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (
    url: string,
    options: Omit<RequestConfig, 'url' | 'skip'> & { data?: D } = {}
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // El token se agregará automáticamente por el interceptor de axios
      const response = await axios({
        ...options,
        url: url.startsWith('/') ? url : `/${url}`,
        method: options.method || 'POST',
        headers: {
          ...options.headers,
        },
        withCredentials: true, // Asegurar que withCredentials esté configurado
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Error desconocido';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  return { ...state, mutate };
};
