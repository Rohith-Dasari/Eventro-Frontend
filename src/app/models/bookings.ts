export interface Booking {
  user_id: string;
  booking_date: string;
  booking_id: string;
  show_id: string;
  time_booked: string;
  show_date?: string;
  ShowDate?: string;
  total_price: number;
  seats: string[];
  venue_city: string;
  venue_name: string;
  venue_state: string;
  event_name: string;
  event_duration: number;
  event_id: string;
}

export interface BookingResponse {
  user_id: string;
  booking_date: string;
  booking_id: string;
  show_id: string;
  time_booked: string;
  total_price: number;
  seats: string[];
  venue_city: string;
  venue_name: string;
  venue_state: string;
  event_name: string;
  event_duration: number;
  event_id: string;
}