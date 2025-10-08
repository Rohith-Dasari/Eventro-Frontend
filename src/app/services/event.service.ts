import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Event } from "../models/events";

@Injectable({
  providedIn: 'root'
})

export class EventService{
  private httpClient=inject(HttpClient);

  getEvents(): Observable<Event[]>{
    return this.httpClient.get<Event[]>('events?location=noida')
  }

  searchEventsByName(name: string, category:string|null): Observable<Event[]> {
    let params = new HttpParams().set('eventname', name);
    if (category) {
      params = params.set('category', category);
    }
    return this.httpClient.get<Event[]>('events', { params });
  }

  getShows(eventId: string): Observable<any> {
    let params = new HttpParams().set('eventId', eventId);
    return this.httpClient.get('shows', { params });
  }  

  getVenue(venueId: string): Observable<any> {
    let params = new HttpParams().set('venueId', venueId);
    return this.httpClient.get('venues', { params });
  }

  getShowById(showId: string): Observable<any> {
    let params = new HttpParams().set('showId', showId);
    return this.httpClient.get('shows', { params });
  }
  getShowsByHostId(hostId: string): Observable<any> {
  let params = new HttpParams().set('hostId', hostId);
  return this.httpClient.get('shows', { params });
}
}