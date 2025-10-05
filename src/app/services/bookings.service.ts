import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, forkJoin, switchMap, map, of } from "rxjs";
import { BookingResponse, EnrichedBooking, Show } from "../models/bookings";
import { EventService } from "./event.service";

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private httpClient = inject(HttpClient);
  private eventService = inject(EventService);

  getBookings(): Observable<EnrichedBooking[]> {
    const userID = localStorage.getItem('user_id');
    let params = new HttpParams().set('userId', userID as string);
    
    return this.httpClient.get<BookingResponse[]>('bookings', { params }).pipe(
      switchMap(bookings => {
        if (!bookings || bookings.length === 0) {
          return of([]);
        }
        
        // Get show details for each booking
        const enrichedBookings$ = bookings.map(booking => 
          this.enrichBookingWithDetails(booking)
        );
        
        return forkJoin(enrichedBookings$);
      })
    );
  }

  private enrichBookingWithDetails(booking: BookingResponse): Observable<EnrichedBooking> {
    return this.eventService.getShows(booking.show_id).pipe(
      map((showResponse: Show[]) => {
        // The API returns an array, so we take the first show
        const show = showResponse[0];
        
        const enrichedBooking: EnrichedBooking = {
          ...booking,
          show_details: show
        };
        
        return enrichedBooking;
      })
    );
  }

  // Original simple method if you need it
  getBookingsRaw(): Observable<BookingResponse[]> {
    const userID = localStorage.getItem('user_id');
    let params = new HttpParams().set('userId', userID as string);
    return this.httpClient.get<BookingResponse[]>('bookings', { params });
  }
}
