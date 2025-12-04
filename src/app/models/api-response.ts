export interface ApiResponse<T> {
  message: string;
  status_code: number;
  data?: T;
}
