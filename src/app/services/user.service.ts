import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpClient=inject(HttpClient);
  getProfile(userId:string){
    return this.httpClient.get(`${userId}/profile`);
  }

}
