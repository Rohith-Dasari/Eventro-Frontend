import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpClient = inject(HttpClient);

  getProfile(email: string): Observable<UserProfile> {
    return this.httpClient.get<UserProfile>(`users/email/${email}`);
  }

  updateProfile(userId: string, reqBody: any) {
    return this.httpClient.patch(`${userId}/profile`, reqBody);
  }
}
