import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class EventService{
    private httpClient=inject(HttpClient);
    getBookings(){
        let params=new HttpParams();
        const userID=localStorage.getItem('user_id');
        params.set('userId',(userID as string));
        return this.httpClient.get('bookings',{params:params});
        
    }
    getEvents(){
        return this.httpClient.get('events?location=noida')
    }
}