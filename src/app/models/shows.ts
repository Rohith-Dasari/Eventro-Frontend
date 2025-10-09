export interface Shows {
    id: string;
    host_id: string;
    venue_id: string;
    event_id: string;
    created_at: string;
    is_blocked: boolean;
    price: number;
    show_date: string;
    show_time: string;
    booked_seats: string[];
}

export interface CreateShow{
    event_id:string;
    venue_id:string;
    show_date:string;
    show_time:string;
    price:null|number;
}