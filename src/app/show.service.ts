import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateShow } from './models/shows';
import { ApiResponse } from './models/api-response';
import { mapToData } from './shared/operators/map-to-data';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  constructor(private httpClient: HttpClient) {}

  addShow(reqBody: CreateShow) {
    console.log('hdhdhdsss');
    console.log(reqBody.show_date);
    console.log(reqBody.show_time);
    return this.httpClient
      .post<ApiResponse<any>>('shows', reqBody)
      .pipe(mapToData<any>());
  }

  blockShow(showID: string, shouldBlock: boolean) {
    const reqBody = {
      is_blocked: shouldBlock,
    };
    return this.httpClient
      .patch<ApiResponse<any>>(`shows/${showID}`, reqBody)
      .pipe(mapToData<any>());
  }
}
