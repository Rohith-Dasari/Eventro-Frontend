import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user';
import { ApiResponse } from '../models/api-response';
import { mapToData } from '../shared/operators/map-to-data';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpClient = inject(HttpClient);

  getProfile(user_id: string): Observable<UserProfile> {
    return this.httpClient
      .get<ApiResponse<UserProfile>>(`users/${user_id}`)
      .pipe(mapToData<UserProfile>());
  }

  updateProfile(userId: string, reqBody: any) {
    return this.httpClient
      .patch<ApiResponse<UserProfile>>(`${userId}/profile`, reqBody)
      .pipe(mapToData<UserProfile>());
  }
}
