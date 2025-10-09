import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { VenueService } from '../services/venue.service';
import { createVenue } from '../models/venues';

@Component({
  selector: 'app-add-venue-dialog',
  imports: [CommonModule,FormsModule,DialogModule,InputTextModule,ButtonModule],
  templateUrl: './add-venue-dialog.component.html',
  styleUrl: './add-venue-dialog.component.scss'
})
export class AddVenueDialogComponent {
  @Output() venueAdded=new EventEmitter<void>();
  private venueService=inject(VenueService);

  visible=false;

  newVenue:createVenue={
    name:'',
    city:'',
    state:'',
    isSeatLayoutRequired:true,
  }

  open(){
    this.visible=true;
  }

  close(){
    this.visible=false;
    this.resetForm();
  }

  resetForm(){
    this.newVenue={
    name:'',
    city:'',
    state:'',
    isSeatLayoutRequired:true,
  };
  }

  submit(){
    if (!this.newVenue.name || !this.newVenue.state||!this.newVenue.city) {
      return;
    }
    this.venueService.addVenue(this.newVenue).subscribe({
      next: (res) => {
        console.log('Event added successfully:', res);
        this.close();
        this.venueAdded.emit(); 
      },
      error: (err) => {
        console.error('Error adding event:', err);
      }
    });;
  }

}
