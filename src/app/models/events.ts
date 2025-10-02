export interface Event{
    id:string,
    name:string,
    description: string,
    duration: string,
    category: string,
    is_blocked:boolean,
    artist_ids: string[]
}