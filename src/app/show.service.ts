import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateShow } from './models/shows';

@Injectable({
  providedIn: 'root'
})

export class ShowService {

  constructor(private httpClient: HttpClient) { }

  addShow(reqBody:CreateShow){
    return this.httpClient.post('shows',reqBody);
  }
}
