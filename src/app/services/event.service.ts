import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class EventService{
  private httpClient=inject(HttpClient);
  
  getBookings(): Observable<any>{
      let params=new HttpParams();
      const userID=localStorage.getItem('user_id');
      params.set('userId',(userID as string));
      return this.httpClient.get('bookings',{params:params});
  }

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
}