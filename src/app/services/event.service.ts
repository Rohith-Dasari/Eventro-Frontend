import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateEventRequest, Event } from '../models/events';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private httpClient = inject(HttpClient);

  getEvents(): Observable<Event[]> {
    return this.httpClient.get<Event[]>('events?city=noida');
  }
  getEventByID(id: string): Observable<Event> {
    return this.httpClient.get<Event>(`events/${id}`);
  }

  searchEventsByName(
    name: string,
    category: string | null
  ): Observable<Event[]> {
    let params = new HttpParams().set('name', name);
    if (category) {
      params = params.set('category', category);
    }
    return this.httpClient.get<Event[]>('events', { params });
  }

  getBlockedEvents(): Observable<Event[]> {
    return this.httpClient.get<Event[]>('events?city=noida&isBlocked=true');
  }

  moderateEvent(eventID: string, isBlocked: boolean): Observable<any> {
    console.log('sent request');
    const requestBody = {
      is_blocked: isBlocked,
    };
    return this.httpClient.patch(`events/${eventID}`, requestBody, {
      responseType: 'text' as 'json',
    });
  }

  getEventsofShows(hostID: string): Observable<Event[]> {
    return this.httpClient.get<Event[]>(`hosts/${hostID}/events`);
  }

  getShows(eventId: string): Observable<any> {
    let params = new HttpParams().set('eventID', eventId).set('city', "noida");
    return this.httpClient.get('shows', { params });
  }

  getShowsByHostAndEvent(eventId: string, hostID: string): Observable<any> {
    let params = new HttpParams().set('eventID', eventId).set('hostID', hostID).set('city', "noida");

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
  addEvent(eventData: CreateEventRequest): Observable<any> {
    return this.httpClient.post('events', eventData);
  }
}
