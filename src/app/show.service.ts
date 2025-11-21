import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateShow } from './models/shows';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  constructor(private httpClient: HttpClient) {}

  addShow(reqBody: CreateShow) {
    console.log('hdhdhdsss');
    console.log(reqBody.show_date);
    console.log(reqBody.show_time);
    return this.httpClient.post('shows', reqBody);
  }

  blockShow(showID: string, shouldBlock: boolean) {
    const reqBody = {
      is_blocked: shouldBlock,
    };
    return this.httpClient.patch(`shows/${showID}`, reqBody);
  }
}
