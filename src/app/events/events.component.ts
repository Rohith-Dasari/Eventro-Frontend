import { Component, OnInit, inject } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { Event } from '../models/events';
import { CardModule } from 'primeng/card';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-events',
  imports: [CommonModule, CardModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})

export class EventsComponent implements OnInit{
  private router=inject(Router)
  private route=inject(ActivatedRoute)
  private eventService=inject(EventService);
  upcomingBookings=[];
  events:Event[]=[];
  defaultImage = './images/hp3.jpg';

  ngOnInit(): void {
    // console.log('hit')
    this.loadData();
    // console.log('done')
  }

  loadData(){
    const bookingSub=this.eventService.getBookings().subscribe(data => {
      // this.upcomingBookings=data;
    },);

    this.eventService.getEvents().subscribe({
     next:(data)=>{
        this.events=data as Event[];
        console.log(data)
     },
     error:(err)=>{
        console.log(err);
     }
    });
  }

  goToEventDetails(event: Event){
    this.router.navigate(['/dashboard/events', event.id], {
    state: { selectedEvent: event }
    });
  }
}
    