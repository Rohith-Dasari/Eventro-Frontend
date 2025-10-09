import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createVenue, Venues } from '../models/venues';

@Injectable({
  providedIn: 'root'
})

export class VenueService {

  constructor(private httpClient: HttpClient) { }

  getVenues(hostId:string):Observable<Venues[]>{
    let params=new HttpParams().set('hostId',hostId);
    params.set('isBlocked',false);
    return this.httpClient.get<Venues[]>('venues',{params});
  }

  getBlockedVenues(hostId:string):Observable<Venues[]>{
    let params=new HttpParams().set('hostId',hostId);
    params.set('isBlocked',true);
    return this.httpClient.get<Venues[]>('venues',{params});
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
