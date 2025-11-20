export interface Event{
    id:string,
    name:string,
    description: string,
    duration: string,
    category: string,
    is_blocked:boolean,
    artist_ids: string[]
    artist_names:string[]
}

export interface CreateEventRequest {
    name: string;
    description: string;
    duration: string;
    category: string;
    artist_ids: string[];
    artist_names?: string[];
}