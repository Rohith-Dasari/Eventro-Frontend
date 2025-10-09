import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { VenueService } from '../services/venue.service';
import { VenuesRowComponent } from '../venues-row/venues-row.component';
import { Venues } from '../models/venues';
import { AddVenueDialogComponent } from '../add-venue-dialog/add-venue-dialog.component';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-venues',
  imports: [VenuesRowComponent,AddVenueDialogComponent,ButtonModule,DialogModule],
  templateUrl: './venues.component.html',
  styleUrl: './venues.component.scss'
})

export class VenuesComponent {
  private auth=inject(AuthService);
  private userID:string|null;
  private venueService=inject(VenueService);
  venues: Venues[] = [];
  blockedVenues: Venues[] = [];
  constructor(){
    this.userID=this.auth.getID();
  }
  ngOnInit() {
  this.refreshVenues();
}

  getVenues(){
    if (this.userID){
    this.venueService.getVenues(this.userID as string).subscribe({
      next:
      (value)=>{this.venues=value;},
      error:
      err=>console.log(err)
      }
    );
    }
  }

  getBlockedVenues(){
    if (this.userID){
    this.venueService.getBlockedVenues(this.userID as string).subscribe({
      next:
      (value)=>{this.blockedVenues=value;console.log(value)},
      error:
      err=>console.log(err)
      }
    );
    }
  }

  refreshVenues() {
    if (!this.userID) return;

    // forkJoin({
    //   venues: this.venueService.getVenues(this.userID),
    //   blocked: this.venueService.getBlockedVenues(this.userID)
    // }).subscribe({
    //   next: ({ venues, blocked }) => {
    //     this.venues = venues;
    //     this.blockedVenues = blocked;
    //   },
    //   error: (err) => console.error(err)
    // });
    this.getVenues();
    this.getBlockedVenues();
  }

}
