import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createVenue, Venues } from '../models/venues';

@Injectable({
  providedIn: 'root'
})

export class VenueService {

  constructor(private httpClient: HttpClient) { }

  getVenues(hostId: string): Observable<Venues[]> {
    return this.httpClient.get<Venues[]>(`host/${hostId}/venues`);
  }

  getBlockedVenues(hostId: string): Observable<Venues[]> {
    return this.httpClient.get<Venues[]>(`host/${hostId}/venues?isBlocked=true`);
  }

  moderateVenue(venueID:string, status:boolean):Observable<any>{
    let reqBody={
      is_blocked:status
    }
    return this.httpClient.patch<any>(`venues/${venueID}`,reqBody);
  }

  addVenue(venue:createVenue):Observable<any>{
    return this.httpClient.post<any>("venues",venue);
  }

}
