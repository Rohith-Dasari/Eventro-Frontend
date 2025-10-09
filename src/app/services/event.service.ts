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
  getEventByID(id: string):Observable<Event>{
    const params=new HttpParams().set('eventID',id);
    return this.httpClient.get<Event>('events',{params});
  }

  searchEventsByName(name: string, category:string|null): Observable<Event[]> {
    let params = new HttpParams().set('eventname', name);
    if (category) {
      params = params.set('category', category);
    }
    return this.httpClient.get<Event[]>('events', { params });
  }

  getBlockedEvents():Observable<Event[]>{
    return this.httpClient.get<Event[]>('events?isBlocked=true');
  }
  
  moderateEvent(eventID:string,isBlocked:boolean):Observable<any>{
    console.log("sent request");
    const requestBody={
      'isBlocked':isBlocked
    }
    return this.httpClient.patch(`events/${eventID}`, requestBody);
  }

  getEventsofShows(hostID:string):Observable<Event[]>{
    return this.httpClient.get<Event[]>(`hosts/${hostID}/events`);
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
addEvent(eventData: any): Observable<any> {
  return this.httpClient.post('events', eventData);
}
}