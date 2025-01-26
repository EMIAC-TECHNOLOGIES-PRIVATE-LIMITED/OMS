import axios, { Method } from 'axios';
import { GetViewDataResponse } from '../../../shared/src/types/index';

const token: string = import.meta.env.VITE_API_TOKEN ;
const api : string = import.meta.env.VITE_API_URL;

export async function fetchDataPage(
  endpoint: string,
  method: Method,
  params?: Record<string, any>,
  data?: any
): Promise<GetViewDataResponse> {
  try {
    const response = await axios.request<GetViewDataResponse>({
      url: `${api}${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params,
      data,
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
}
