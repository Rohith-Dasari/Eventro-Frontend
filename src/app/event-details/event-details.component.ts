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
  shows: any[] = [];
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

  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  visible = false;

  ngOnInit(): void {
    this.role = this.authService.getRole() as string;
    this.event = history.state?.selectedEvent;
    if (!this.event) {
      console.error('No event info available.');
      return;
    }
    this.eventService.getEventByID(this.event.id).subscribe({
      next: (val) => {
        this.event.is_blocked = val.is_blocked;
        this.checked = this.event.is_blocked;
        this.status = this.checked
          ? 'The event has been blocked'
          : 'The event has been unblocked';
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.checked = this.event.is_blocked;
    this.status = this.checked
      ? 'The event has been blocked'
      : 'The event has been unblocked';

    this.loadEvent(this.event.id);
  }

  loadEvent(eventId: string) {
    let shows$;

    if (this.role === 'Host') {
      const hostID = this.authService.getID();
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
      next: (shows: any[]) => {
        console.log('Shows loaded:', shows);
        this.shows = shows;

        if (!shows.length) {
          this.availableDates = [];
          this.selectedDate = undefined as unknown as Date;
          return;
        }

        this.shows.forEach((s) => {
          s.ShowDate = new Date(s.ShowDate);
        });

        const uniqueDates = Array.from(
          new Set(
            this.shows.map((s: any) => new Date(s.ShowDate).toDateString())
          )
        )
          .map((d) => new Date(d))
          .sort((a, b) => a.getTime() - b.getTime());

        this.availableDates = uniqueDates.slice(0, 7);

        this.selectedDate = this.availableDates[0];
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

  ngOnDestroy(): void {
    this.showsSubscription?.unsubscribe();
  }

  onToggle(newValue: boolean) {
    console.log('Toggle switch changed to:', newValue);

    this.isModerating = true;

    this.eventService
      .moderateEvent(this.event.id, this.checked)
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
