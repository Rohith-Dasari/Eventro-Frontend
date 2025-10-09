import { Component, inject, OnInit } from '@angular/core';
import { EventService } from '../services/event.service';
import { Event } from '../models/events';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { ShowsComponent } from '../shows/shows.component';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, ButtonModule, DatePipe, SliderModule, FormsModule, ShowsComponent,ToggleSwitchModule],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})


export class EventDetailsComponent implements OnInit {
  event!: Event;
  shows: any[] = [];
  availableDates: Date[] = [];
  selectedDate!: Date;
  rangeValues: number[] = [0, 3000];
  refreshing = false;
  checked!:boolean;
  status!:string;
  role!:string;
  

  private eventService = inject(EventService);
  private authService=inject(AuthService);

  ngOnInit(): void {
    this.role=this.authService.getRole() as string;
    this.event = history.state?.selectedEvent;
    if (!this.event) {
      console.error('No event info available.');
      return;
    }
    this.eventService.getEventByID(this.event.id).subscribe(
      {
        next:
        (val)=>{
          this.event.is_blocked=val.is_blocked;
        },
        error:
        err=>{
          console.log(err);
        }
      }
    )
    this.checked=this.event.is_blocked;

    if (this.checked){
      this.status="The event has been blocked";
    }else{
      this.status="The event has been unblocked";
    }

    this.loadEvent(this.event.id);
  }

  loadEvent(eventId: string) {
    this.eventService.getShows(eventId).subscribe((shows: any[]) => {
      console.log(shows);
      this.shows = shows;

      if (!shows.length) return;

      this.shows.forEach(s => {
        s.ShowDate = new Date(s.ShowDate);
      });
      
      const firstDate = this.shows.reduce((earliest: Date, s: any) => {
        const d = new Date(s.ShowDate);
        return d < earliest ? d : earliest;
      }, new Date(this.shows[0].ShowDate));

      
      this.availableDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(firstDate);
        d.setDate(d.getDate() + i);
        return d;
      });

      this.selectedDate = this.availableDates[0];
    });
  }

  selectDate(date: Date) {
    this.selectedDate = date;
  }

  refreshShows() {
    this.refreshing = true;
    this.eventService.getShows(this.event.id).subscribe((shows: any[]) => {
      this.shows = shows;

      this.shows.forEach(s => {
        s.ShowDate = new Date(s.ShowDate);
      });

      this.refreshing = false;
    });
  }

  onToggle(newValue: boolean){
    console.log('Toggle switch changed to:', newValue);
    
    this.eventService.moderateEvent(this.event.id,this.checked).subscribe({
      next:
      val=>{
        console.log("succesful moderation")
        if (this.checked){
      this.status="The event has been blocked";
    }else{
      this.status="The event has been unblocked";
    }
    this.event.is_blocked!=this.event.is_blocked;
      },
      error:
      err=>{
        console.log(err)
      }
    }
    );
  }
}
