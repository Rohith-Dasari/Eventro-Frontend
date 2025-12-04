import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createVenue, Venues } from '../models/venues';
import { ApiResponse } from '../models/api-response';
import { mapToData } from '../shared/operators/map-to-data';

@Injectable({
  providedIn: 'root'
})

export class VenueService {

  constructor(private httpClient: HttpClient) { }

  getVenues(hostId: string): Observable<Venues[]> {
    return this.httpClient
      .get<ApiResponse<Venues[]>>(`host/${hostId}/venues`)
      .pipe(mapToData<Venues[]>());
  }

  getBlockedVenues(hostId: string): Observable<Venues[]> {
    return this.httpClient
      .get<ApiResponse<Venues[]>>(`host/${hostId}/venues?isBlocked=true`)
      .pipe(mapToData<Venues[]>());
  }

  moderateVenue(venueID:string, status:boolean):Observable<any>{
    let reqBody={
      is_blocked:status
    }
    return this.httpClient
      .patch<ApiResponse<any>>(`venues/${venueID}`,reqBody)
      .pipe(mapToData<any>());
  }

  addVenue(venue:createVenue):Observable<any>{
    return this.httpClient
      .post<ApiResponse<any>>("venues",venue)
      .pipe(mapToData<any>());
  }

}
