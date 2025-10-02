import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { Shows } from '../models/shows';

@Component({
  selector: 'app-shows',
  imports: [CommonModule,FormsModule],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.scss'
})
export class ShowsComponent implements OnChanges {
  @Input() shows: any[] = [];
  @Input() selectedDate!: Date;
  @Input() priceRange!: number[];

  venues: { name: string; shows: any[] }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shows'] || changes['selectedDate'] || changes['priceRange']) {
      this.filterShows();
    }
  }

  filterShows() {
    if (!this.selectedDate || !this.shows) return;

    const showsForDate = this.shows.filter(
      s =>
        new Date(s.ShowDate).toDateString() === this.selectedDate.toDateString() &&
        s.Price >= this.priceRange[0] &&
        s.Price <= this.priceRange[1]
    );

    const groupedByVenue: { [venueId: string]: any } = {};
    showsForDate.forEach(show => {
      if (!groupedByVenue[show.Venue.ID]) {
        groupedByVenue[show.Venue.ID] = {
          name: show.Venue.Name,
          shows: []
        };
      }
      groupedByVenue[show.Venue.ID].shows.push(show);
    });

    this.venues = Object.values(groupedByVenue);
  }

  getAvailabilityColor(show: any): string {
    console.log(show);
    const totalSeats = 100; 
    const availableSeats = totalSeats - (show.BookedSeats!.length || 0);

    if (availableSeats > 60) return 'green';
    if (availableSeats > 30) return 'orange';
    return 'red';
  }

}
