import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeatMapComponent } from '../seat-map/seat-map.component';
import { Show } from '../models/shows';

type ShowInput = Show & { showDateObj?: Date };

@Component({
  selector: 'app-shows',
  imports: [CommonModule, FormsModule, SeatMapComponent],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.scss',
})
export class ShowsComponent implements OnChanges {
  @Input() shows: ShowInput[] = [];
  @Input() selectedDate!: Date;
  @Input() priceRange!: number[];
  @Input() showBlocked: boolean = false;
  @Input() userRole: string | null = null;
  @Input() eventName?: string;

  venues: { name: string; shows: ShowInput[] }[] = [];
  selectedShow: ShowInput | null = null;
  seatMapVisible: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['shows'] ||
      changes['selectedDate'] ||
      changes['priceRange'] ||
      changes['showBlocked'] ||
      changes['userRole']
    ) {
      this.filterShows();
    }
  }

  filterShows() {
    if (!this.selectedDate || !this.shows?.length) return;

    const showsForDate = this.shows.filter((show) => {
      const showDate = this.getShowDate(show);
      if (!showDate) {
        return false;
      }

      const price = this.getPrice(show);

      return (
        showDate.toDateString() === this.selectedDate.toDateString() &&
        price >= this.priceRange[0] &&
        price <= this.priceRange[1] &&
        this.matchesBlockedFilter(show)
      );
    });

    const groupedByVenue: { [venueId: string]: { name: string; shows: ShowInput[] } } = {};

    showsForDate.forEach((show) => {
      const venueId = this.getVenueId(show);
      const venueName = this.getVenueName(show);

      if (!groupedByVenue[venueId]) {
        groupedByVenue[venueId] = {
          name: venueName,
          shows: [],
        };
      }
      groupedByVenue[venueId].shows.push(show);
    });

    this.venues = Object.values(groupedByVenue).map((venueGroup) => ({
      ...venueGroup,
      shows: [...venueGroup.shows].sort((a, b) =>
        this.compareByShowTime(this.getShowTime(a), this.getShowTime(b))
      ),
    }));
  }

  private matchesBlockedFilter(show: ShowInput): boolean {
    const isBlocked = this.isShowBlocked(show);

    if (!this.canModerateShows()) {
      return !isBlocked;
    }

    if (this.showBlocked) {
      return isBlocked;
    }

    return true;
  }

  private isShowBlocked(show: ShowInput): boolean {
    const rawValue = (show as any)?.is_blocked ?? (show as any)?.IsBlocked;
    if (typeof rawValue === 'boolean') {
      return rawValue;
    }
    if (typeof rawValue === 'string') {
      const normalized = rawValue.trim().toLowerCase();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
    if (typeof rawValue === 'number') {
      return rawValue === 1;
    }
    return false;
  }

  private canModerateShows(): boolean {
    const role = (this.userRole ?? '').toLowerCase();
    return role === 'admin' || role === 'host';
  }

  private compareByShowTime(timeA?: string, timeB?: string): number {
    const minutesA = this.showTimeToMinutes(timeA);
    const minutesB = this.showTimeToMinutes(timeB);
    return minutesA - minutesB;
  }

  private showTimeToMinutes(time?: string): number {
    if (!time) return Number.MAX_SAFE_INTEGER;

    const trimmed = time.trim();
    if (!trimmed) return Number.MAX_SAFE_INTEGER;

    const [hourPart, minutePart, secondPart] = trimmed.split(':');
    const hours = Number(hourPart);
    const minutes = Number(minutePart);
    const seconds = secondPart !== undefined ? Number(secondPart) : 0;

    if ([hours, minutes, seconds].some((value) => Number.isNaN(value))) {
      return Number.MAX_SAFE_INTEGER;
    }

    return hours * 60 + minutes + seconds / 60;
  }

  getAvailabilityColor(show: ShowInput): string {
    const totalSeats = 100;
    const bookedSeatsCount = this.getBookedSeats(show).length;
    const availableSeats = totalSeats - bookedSeatsCount;

    if (availableSeats > 60) return 'green';
    if (availableSeats > 30) return 'orange';
    return 'red';
  }
  openSeatMap(show: ShowInput) {
    this.selectedShow = show;
    this.seatMapVisible = true;
  }

  getShowTime(show: ShowInput | null): string {
    if (!show) return 'Time TBD';
    return (
      ((show as any)?.show_time ?? (show as any)?.ShowTime ?? 'Time TBD')
    );
  }

  getShowPrice(show: ShowInput | null): number {
    if (!show) return 0;
    const price = this.getPrice(show);
    return typeof price === 'number' ? price : 0;
  }

  private getShowDate(show: ShowInput): Date | null {
    if (show.showDateObj instanceof Date) {
      return show.showDateObj;
    }
    const raw = (show as any)?.show_date ?? (show as any)?.ShowDate;
    if (!raw) {
      return null;
    }
    if (raw instanceof Date) {
      return raw;
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private getPrice(show: ShowInput): number {
    const value = (show as any)?.price ?? (show as any)?.Price;
    return typeof value === 'number' ? value : 0;
  }

  private getVenue(show: ShowInput): any {
    return (show as any)?.venue ?? (show as any)?.Venue;
  }

  private getVenueId(show: ShowInput): string {
    const venue = this.getVenue(show);
    return venue?.venue_id ?? venue?.ID ?? 'unknown-venue';
  }

  private getVenueName(show: ShowInput): string {
    const venue = this.getVenue(show);
    return venue?.venue_name ?? venue?.Name ?? 'Venue TBD';
  }

  private getBookedSeats(show: ShowInput): string[] {
    const seats = (show as any)?.booked_seats ?? (show as any)?.BookedSeats;
    return Array.isArray(seats) ? seats : [];
  }
}
