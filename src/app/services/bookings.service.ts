import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, of, catchError, tap } from "rxjs";
import { BookingResponse, Booking } from "../models/bookings";
import { ApiResponse } from "../models/api-response";
import { mapToData } from "../shared/operators/map-to-data";

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private httpClient = inject(HttpClient);

  addBooking(showId: string, seats: string[], userIdentifier?: string | null): Observable<BookingResponse> {
    const bookingRequest: any = {
      user_id:userIdentifier,
      show_id: showId,
      seats: seats,
    };

    if (userIdentifier) {
      bookingRequest.user_id = userIdentifier;
    }
    

    return this.httpClient
      .post<ApiResponse<BookingResponse>>('bookings', bookingRequest)
      .pipe(mapToData<BookingResponse>());
  }

  getBookings(): Observable<Booking[]> {
    console.log('booking-service stage: getBookings method called');
    let userID = localStorage.getItem('user_id');
    if (!userID) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userID = parsedUser?.user_id;
        } catch (error) {
          console.warn('booking-service stage: failed to parse stored user for fallback id', error);
        }
      }
    }
    if (!userID) {
      console.warn('booking-service stage: no user ID found in storage, returning empty bookings list');
      return of([]);
    }
    const endpoint = `users/${userID}/bookings`;
    console.log('booking-service stage: making API call to', endpoint);
    
    return this.httpClient.get<ApiResponse<Booking[]>>(endpoint).pipe(
      mapToData<Booking[]>(),
      tap(bookings => {
        console.log('booking-service stage: raw API response received:', bookings);
        console.log('booking-service stage: response length:', bookings?.length || 0);
      }),
      catchError(error => {
        console.error('booking-service stage: API error occurred:', error);
        console.log('booking-service stage: returning empty array due to error');
        return of([]); 
      })
    );
  }
}
