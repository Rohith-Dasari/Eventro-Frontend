import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateEventRequest, Event } from '../models/events';
import { ApiResponse } from '../models/api-response';
import { mapToData } from '../shared/operators/map-to-data';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private httpClient = inject(HttpClient);
  private locationService = inject(LocationService);

  //this will only bring unblocked events
  getEvents(): Observable<Event[]> {
    const params = new HttpParams()
      .set('city', this.getSelectedCity())
      .set('is_blocked', 'false');
    return this.httpClient
      .get<ApiResponse<Event[]>>('events', { params })
      .pipe(mapToData<Event[]>());
  }

  getEventByID(id: string): Observable<Event> {
    return this.httpClient
      .get<ApiResponse<Event>>(`events/${id}`)
      .pipe(mapToData<Event>());
  }

  searchEventsByName(
    name: string,
    category: string | null,
    includeCity = false
  ): Observable<Event[]> {
    let params = new HttpParams().set('name', name);
    if (category) {
      params = params.set('category', category);
    }
    if (includeCity) {
      params = params.set('city', this.getSelectedCity());
    }
    return this.httpClient
      .get<ApiResponse<Event[]>>('events', { params })
      .pipe(mapToData<Event[]>());
  }

  getBlockedEvents(): Observable<Event[]> {
    const params = new HttpParams()
      .set('city', this.getSelectedCity())
      .set('is_blocked', 'true');
    return this.httpClient
      .get<ApiResponse<Event[]>>('events', { params })
      .pipe(mapToData<Event[]>());
  }

  moderateEvent(eventID: string, isBlocked: boolean): Observable<any> {
    console.log('sent request');
    const requestBody = {
      is_blocked: isBlocked,
    };
    return this.httpClient
      .patch<ApiResponse<any>>(`events/${eventID}`, requestBody)
      .pipe(mapToData<any>());
  }

  getEventsofShows(hostID: string): Observable<Event[]> {
    return this.httpClient
      .get<ApiResponse<Event[]>>(`hosts/${hostID}/events`)
      .pipe(mapToData<Event[]>());
  }

  getShows(eventId: string): Observable<any> {
    const params = new HttpParams()
      .set('event_id', eventId)
      .set('city', this.getSelectedCity());
    return this.httpClient
      .get<ApiResponse<any>>('shows', { params })
      .pipe(mapToData<any>());
  }

  getShowsByHostAndEvent(eventId: string, hostID: string): Observable<any> {
    const params = new HttpParams()
      .set('event_id', eventId)
      .set('host_id', hostID)
      .set('city', this.getSelectedCity());

    return this.httpClient
      .get<ApiResponse<any>>('shows', { params })
      .pipe(mapToData<any>());
  }

  getVenue(venueId: string): Observable<any> {
    let params = new HttpParams().set('venue_id', venueId);
    return this.httpClient
      .get<ApiResponse<any>>('venues', { params })
      .pipe(mapToData<any>());
  }

  getShowById(showId: string): Observable<any> {
    let params = new HttpParams().set('show_id', showId);
    return this.httpClient
      .get<ApiResponse<any>>('shows', { params })
      .pipe(mapToData<any>());
  }
  getShowsByHostId(hostId: string): Observable<any> {
    let params = new HttpParams().set('host_id', hostId);
    return this.httpClient
      .get<ApiResponse<any>>('shows', { params })
      .pipe(mapToData<any>());
  }
  addEvent(eventData: CreateEventRequest): Observable<any> {
    return this.httpClient
      .post<ApiResponse<any>>('events', eventData)
      .pipe(mapToData<any>());
  }

  private getSelectedCity(): string {
    return this.locationService.getCity();
  }
}
