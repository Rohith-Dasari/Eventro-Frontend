import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  visible = false;

  ngOnInit(): void {
    this.role = this.authService.getRole() as string;
    const eventFromState = history.state?.selectedEvent as Event | undefined;
    const eventId = eventFromState?.id ?? this.route.snapshot.paramMap.get('id');

    if (!eventId) {
      console.error('No event identifier available.');
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Event',
        detail: 'We could not determine which event to display.',
        life: 3000,
      });
      this.router.navigate(['/dashboard/events']);
      return;
    }

    if (eventFromState) {
      this.event = eventFromState;
      this.syncModerationState(eventFromState.is_blocked);
    }

    this.fetchEventDetails(eventId);
    this.loadEvent(eventId);
  }

  private fetchEventDetails(eventId: string) {
    this.eventService.getEventByID(eventId).subscribe({
      next: (eventResponse) => {
        this.event = eventResponse;
        this.syncModerationState(eventResponse.is_blocked);
      },
      error: (err) => {
        console.error('Failed to load event details', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: 'Unable to load the event details. Please try again later.',
          life: 3000,
        });
      },
    });
  }

  private syncModerationState(isBlocked: boolean) {
    this.checked = isBlocked;
    this.status = isBlocked
      ? 'The event has been blocked'
      : 'The event has been unblocked';
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

        this.availableDates = uniqueDates.slice(0, 6);

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
        this.syncModerationState(this.checked);
        this.event.is_blocked = this.checked;
        this.messageService.add({
          severity: 'success',
          summary: this.checked ? 'Event Blocked' : 'Event Unblocked',
          detail: `${this.event.name} is now ${this.checked ? 'blocked' : 'active'}.`,
          life: 3000,
        });
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Moderation Failed',
          detail: 'We could not update the event status. Please try again.',
          life: 3000,
        });
        this.syncModerationState(this.event.is_blocked);
      },
    });
  }
}
