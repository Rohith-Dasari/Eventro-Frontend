import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { EventService } from '../services/event.service';
import { Event } from '../models/events';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { ShowsComponent } from '../shows/shows.component';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AuthService } from '../services/auth.service';
import { AddShowDialogComponent } from '../add-show-dialog/add-show-dialog.component';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Show } from '../models/shows';

type ShowWithDate = Show & { showDateObj?: Date };

@Component({
  selector: 'app-event-details',
  imports: [
    CommonModule,
    ButtonModule,
    DatePipe,
    SliderModule,
    FormsModule,
    ShowsComponent,
    ToggleSwitchModule,
    AddShowDialogComponent,
    SpinnerComponent,
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  event!: Event;
  shows: ShowWithDate[] = [];
  availableDates: Date[] = [];
  selectedDate!: Date;
  rangeValues: number[] = [0, 3000];
  refreshing = false;
  checked!: boolean;
  status!: string;
  role!: string;
  showBlocked = false;
  isModerating = false;
  private showsSubscription?: Subscription;
  loadingEventDetails = true;

  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  visible = false;

  ngOnInit(): void {
    this.role = this.authService.getRole() as string;
    this.event = history.state?.selectedEvent;
  //  this.eventService.getEventByID(this.event.id);
    console.log("event-details stage: event from history",this.event);
    if (!this.event) {
      console.error('No event info available.');
      this.loadingEventDetails = false;
      return;
    }
    this.eventService.getEventByID(this.event.id)
    .pipe(finalize(() => {
      this.loadingEventDetails = false;
    }))
    .subscribe({
      next: (fetchedEvent) => {
        console.log('Fetched event details:', fetchedEvent);
        this.event = {
          ...this.event,
          ...fetchedEvent,
          artist_names: fetchedEvent.artist_names ?? [],
          artist_ids: fetchedEvent.artist_ids ?? [],
          description: fetchedEvent.description ?? 'No description available.',
          duration: fetchedEvent.duration ?? 'Duration not available',
        };
        this.checked = this.event.is_blocked;
        this.status = this.checked
          ? 'The event has been blocked'
          : 'The event has been unblocked';
      },
      error: (err) => {
        console.log(err);
      },
    });
    console.log("after fetching",this.event)
    this.checked = this.event.is_blocked;
    this.status = this.checked
      ? 'The event has been blocked'
      : 'The event has been unblocked';

    this.loadEvent(this.event.id);
  }

  loadEvent(eventId: string) {
    if (!this.refreshing) {
      this.refreshing = true;
    }
    let shows$;

    if (this.role === 'Host') {
      const hostID = this.authService.getID();
      if (!hostID) {
        console.warn('Host ID missing, unable to load host-specific shows');
        this.refreshing = false;
        return;
      }
      shows$ = this.eventService.getShowsByHostAndEvent(
        eventId,
        hostID as string
      );
    } else {
      shows$ = this.eventService.getShows(eventId);
    }

    this.showsSubscription?.unsubscribe();

    this.showsSubscription = shows$
      .pipe(finalize(() => (this.refreshing = false)))
      .subscribe({
        next: (shows: Show[]) => {
          console.log('Shows loaded:', shows);
          const processedShows = shows
            .map((show) => ({
              ...show,
              showDateObj: this.parseShowDate(show),
            }))
            .filter((show) => this.isUpcomingShow(show.showDateObj));

          this.shows = processedShows;

          if (!this.shows.length) {
            this.availableDates = [];
            this.selectedDate = undefined as unknown as Date;
            return;
          }

          const uniqueDates = Array.from(
            new Set(
              this.shows
                .map((s) => s.showDateObj)
                .filter((date): date is Date => !!date)
                .map((date) => date.toDateString())
            )
          )
            .map((d) => new Date(d))
            .sort((a, b) => a.getTime() - b.getTime());

          this.availableDates = uniqueDates.slice(0, 6);

          this.selectedDate = this.availableDates.length
            ? this.availableDates[0]
            : (undefined as unknown as Date);
        },
        error: (err) => {
          console.error('Error loading shows:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Load Failed',
            detail: 'Unable to refresh shows. Please try again.',
            life: 3000,
          });
        },
      });
  }

  openDialogBox() {
    this.visible = true;
  }

  selectDate(date: Date) {
    this.selectedDate = date;
  }

  refreshShows() {
    console.log('Refreshing shows after new show added...');
    this.refreshing = true;
    this.loadEvent(this.event.id);
  }

  onShowStatusFilterChange(newValue: boolean) {
    this.showBlocked = newValue;
  }

  private parseShowDate(show: Show): Date | undefined {
    const rawValue = (show as any).show_date ?? (show as any).ShowDate;
    if (!rawValue) {
      return undefined;
    }

    const parsed = rawValue instanceof Date ? new Date(rawValue) : new Date(rawValue);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }

    const rawTime = (show as any).show_time ?? (show as any).ShowTime;
    if (typeof rawTime === 'string') {
      const [hoursStr = '0', minutesStr = '0', secondsStr = '0'] = rawTime.split(':');
      const hours = Number(hoursStr);
      const minutes = Number(minutesStr);
      const seconds = Number(secondsStr);
      if (![hours, minutes, seconds].some((value) => Number.isNaN(value))) {
        parsed.setHours(hours, minutes, seconds, 0);
      }
    }

    return parsed;
  }

  private isUpcomingShow(date?: Date): boolean {
    if (!(date instanceof Date)) {
      return false;
    }

    return date.getTime() >= Date.now();
  }

  ngOnDestroy(): void {
    this.showsSubscription?.unsubscribe();
  }

  onToggle(newValue: boolean) {
    console.log('Toggle switch changed to:', newValue);

    this.checked = newValue;
    this.isModerating = true;

    this.eventService
      .moderateEvent(this.event.id, newValue)
      .pipe(finalize(() => (this.isModerating = false)))
      .subscribe({
      next: (val) => {
        console.log('succesful moderation');
        if (this.checked) {
          this.status = 'The event has been blocked';
          this.messageService.add({
            severity: 'success',
            summary: 'Event Blocked',
            detail: `${this.event.name} is now blocked.`,
            life: 3000,
          });
        } else {
          this.status = 'The event has been unblocked';
          this.messageService.add({
            severity: 'success',
            summary: 'Event Unblocked',
            detail: `${this.event.name} is now active.`,
            life: 3000,
          });
        }
        this.event.is_blocked = this.checked;
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Moderation Failed',
          detail: 'We could not update the event status. Please try again.',
          life: 3000,
        });
        this.checked = this.event.is_blocked;
      },
    });
  }
}
