export interface Venues{
    
        "ID": string,
        "Name": string,
        "HostID": string,
        "City": string,
        "State": string,
        "IsBlocked": boolean
}

export interface createVenue{
        
  name: string;
  city: string;
  state: string;
  isSeatLayoutRequired: boolean;

}