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
    console.log('booking-service stage: getBookings method called');
    const userID = localStorage.getItem('user_id');
    let params = new HttpParams().set('userId', userID as string);
    console.log('booking-service stage: making API call to /bookings with params:', params.toString());
    
    return this.httpClient.get<BookingResponse[]>('bookings', { params }).pipe(
      switchMap(bookings => {
        console.log('booking-service stage: raw API response received:', bookings);
        console.log('booking-service stage: response type:', typeof bookings);
        console.log('booking-service stage: response length:', bookings?.length || 0);
        
        if (!bookings || bookings.length === 0) {
          console.log('booking-service stage: no bookings found, returning empty array');
          return of([]);
        }
        
        console.log('booking-service stage: processing bookings for enrichment');
        const enrichedBookings$ = bookings.map(booking => {
          console.log('booking-service stage: enriching booking:', booking.booking_id);
          return this.enrichBookingWithDetails(booking);
        });
        
        console.log('booking-service stage: waiting for all enriched bookings to complete');
        return forkJoin(enrichedBookings$);
      }),
      catchError(error => {
        console.error('booking-service stage: API error occurred:', error);
        console.log('booking-service stage: returning empty array due to error');
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
}
