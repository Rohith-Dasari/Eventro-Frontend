export interface Booking {
  user_email: string;
  booking_date: string;
  booking_id: string;
  show_id: string;
  time_booked: string;
  show_date?: string;
  ShowDate?: string;
  num_tickets_booked: number;
  total_price: number;
  seats: string[];
  venue_city: string;
  venue_name: string;
  venue_state: string;
  event_name: string;
  event_duration: string;
  event_id: string;
}

export interface BookingResponse {
  booking_id: string;
  user_id: string;
  show_id: string;
  time_booked: string;
  num_tickets: number;
  total_booking_price: number;
  seats: string[];
}