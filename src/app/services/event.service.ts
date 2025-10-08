import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class EventService{
  private httpClient=inject(HttpClient);

  getEvents(): Observable<any>{
    return this.httpClient.get('events?location=noida')
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