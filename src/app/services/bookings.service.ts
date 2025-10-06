import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, forkJoin, switchMap, map, of, catchError } from "rxjs";
import { BookingResponse, EnrichedBooking, Show } from "../models/bookings";
import { EventService } from "./event.service";

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private httpClient = inject(HttpClient);
  private eventService = inject(EventService);

  addBooking(showId: string, seats: string[], userId: string): Observable<BookingResponse> {
    const bookingRequest = {
      show_id: showId,
      seats: seats,
      user_id: userId
    };
    return this.httpClient.post<BookingResponse>('bookings', bookingRequest);
  }

  getBookings(): Observable<EnrichedBooking[]> {
    const userID = localStorage.getItem('user_id');
    let params = new HttpParams().set('userId', userID as string);
    
    return this.httpClient.get<BookingResponse[]>('bookings', { params }).pipe(
      switchMap(bookings => {
        console.log('Raw bookings response:', bookings);
        
        if (!bookings || bookings.length === 0) {
          return of([]);
        }
        
        const enrichedBookings$ = bookings.map(booking => 
          this.enrichBookingWithDetails(booking)
        );
        
        return forkJoin(enrichedBookings$);
      }),
      catchError(error => {
        console.error('Error in getBookings:', error);
        return of([]); 
      })
    );
  }

  private enrichBookingWithDetails(booking: BookingResponse): Observable<EnrichedBooking> {
    console.log('Enriching booking:', booking);
    console.log('Calling getShowById with showId:', booking.show_id);
    
    return this.eventService.getShowById(booking.show_id).pipe(
      map((showResponse: Show[]) => {
        console.log('Show response for booking:', showResponse);
        
        const show = showResponse[0];
        
        if (!show) {
          console.warn('No show data found for showId:', booking.show_id);
          return {
            ...booking,
            show_details: undefined
          };
        }
        
        console.log('Show details:', show);
        
        const enrichedBooking: EnrichedBooking = {
          ...booking,
          show_details: show
        };
        
        return enrichedBooking;
      }),
      catchError(error => {
        console.error('Error getting show details for booking:', booking, error);
        return of({
          ...booking,
          show_details: undefined
        });
      })
    );
  }

  getBookingsRaw(): Observable<BookingResponse[]> {
    const userID = localStorage.getItem('user_id');
    let params = new HttpParams().set('userId', userID as string);
    return this.httpClient.get<BookingResponse[]>('bookings', { params });
  }
}
