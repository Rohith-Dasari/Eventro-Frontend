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

    forkJoin({
        active: this.venueService.getUnblockedVenues(this.userID),
        blocked: this.venueService.getBlockedVenues(this.userID),
    }).subscribe({
          next: ({ active, blocked }) => {
            console.log('venues active response:', active);
            console.log('venues blocked response:', blocked);

            const normalizeList = (val: any): Venues[] => {
              const arr = Array.isArray(val) ? val : val ? [val] : [];
              return arr.map((venue: any) => ({
                ID: venue?.ID ?? venue?.id ?? '',
                Name: venue?.Name ?? venue?.name ?? '',
                HostID: venue?.HostID ?? venue?.host_id ?? '',
                City: venue?.City ?? venue?.city ?? '',
                State: venue?.State ?? venue?.state ?? '',
                IsSeatLayoutRequired: venue?.IsSeatLayoutRequired ?? venue?.is_seat_layout_required ?? false,
                IsBlocked: venue?.IsBlocked ?? venue?.is_blocked ?? false,
              }));
            };

            this.venues = normalizeList(active).filter(v => !v.IsBlocked);
            this.blockedVenues = normalizeList(blocked).filter(v => v.IsBlocked);
      },
      error: (err) => console.error(err)
    });
  }
}
