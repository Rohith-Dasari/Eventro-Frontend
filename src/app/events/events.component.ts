import { Component, OnInit, inject } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events',
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit{
  private eventService=inject(EventService);
  upcomingBookings=[]
  events=[]

  ngOnInit(): void {
    console.log('hit')
    this.loadData();
    console.log('done')
  }

  loadData(){
    const bookingSub=this.eventService.getBookings().subscribe(data => {
            console.log(data);
        },);
    this.eventService.getEvents().subscribe({
       next:(data)=>{
                console.log(data);
      },
      error:(err)=>{
                console.log(err);
      }
    });
  }

}
