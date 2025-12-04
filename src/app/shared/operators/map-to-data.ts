import { map } from 'rxjs';
import { ApiResponse } from '../../models/api-response';

export const mapToData = <T>() =>
  map((response: ApiResponse<T>): T => response?.data as T);
