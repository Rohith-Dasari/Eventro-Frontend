export interface BookingResponse {
  booking_id: string;
  user_id: string;
  show_id: string;
  time_booked: string; 
  num_tickets: number;
  total_booking_price: number;
  seats: string[];
}

export interface Host {
  UserID: string;
  Username: string;
  Email: string;
  PhoneNumber: string;
  Password: string;
  Role: string;
  IsBlocked: boolean;
}

export interface Venue {
  ID: string;
  Name: string;
  HostID: string;
  Host: Host;
  City: string;
  State: string;
  IsBlocked: boolean;
  IsSeatLayoutRequired: boolean;
}

export interface Event {
  ID: string;
  Name: string;
  Description: string;
  HypeMeter: number;
  Duration: string;
  Category: string;
  IsBlocked: boolean;
}

export interface Show {
  ID: string;
  HostID: string;
  Host: Host;
  VenueID: string;
  Venue: Venue;
  EventID: string;
  Event: Event;
  CreatedAt: string;
  IsBlocked: boolean;
  Price: number;
  ShowDate: string;
  ShowTime: string;
  BookedSeats: string[];
}

export interface EnrichedBooking extends BookingResponse {
  show_details?: Show;
}