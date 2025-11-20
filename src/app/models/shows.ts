export interface Show {
    id: string;
    event_id: string;
    host_id: string;
    is_blocked: boolean;
    price: number;
    show_date: string;
    show_time: string;
    booked_seats: string[];
    venue: VenueDTO;
}

export interface CreateShow{
    event_id:string;
    venue_id:string;
    show_date:string;
    show_time:string;
    price:null|number;
}

export interface VenueDTO{
    venue_id: string;
    venue_name: string;
    city:string;
    state: string
}


