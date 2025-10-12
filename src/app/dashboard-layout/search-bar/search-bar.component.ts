import { Component, EventEmitter, Output, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { EventService } from '../../services/event.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Event } from '../../models/events';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  imports: [CommonModule, FormsModule, InputTextModule]
})

export class SearchBarComponent implements OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  isFocused = false;
  searchQuery = '';
  searchResults: Event[] = [];
  showResults = false;
  selectedCategory: string | null = null;
  isInteractingWithResults = false;
  private searchTerm = new Subject<string>();
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);

  @Output() searchTriggered = new EventEmitter<string>();

  // categories = [
  //   { label: 'Movie', value: 'movie' },
  //   { label: 'Sports', value: 'sports' },
  //   { label: 'Concert', value: 'concert' },
  //   { label: 'Workshop', value: 'workshop' },
  //   { label: 'Party', value: 'party' }
  // ];

  constructor(private eventService: EventService, private router: Router) {
    this.searchTerm
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(term => this.eventService.searchEventsByName(term, this.selectedCategory)),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        this.searchResults = results;
        if (this.authService.getRole() === 'Customer') {
          this.searchResults = this.searchResults.filter(event => !event.is_blocked);
        }
        this.showResults = this.searchResults.length > 0;
      });
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    if (!value.trim()) {
      this.resetSearch();
      return;
    }
    this.searchTerm.next(value);
  }

  selectCategory(category: string) {
    this.selectedCategory =
      this.selectedCategory === category ? null : category;
    if (this.searchQuery.trim()) this.searchTerm.next(this.searchQuery);
  }

  selectEvent(event: Event) {
    const targetUrl = `/dashboard/events/${event.id}`;
    const navigationExtras = { state: { selectedEvent: event } };

    if (this.router.url === targetUrl) {
      this.router.navigateByUrl('/dashboard/events', { skipLocationChange: true }).then(() => {
        this.router.navigate([targetUrl], navigationExtras);
      });
    } else {
      this.router.navigate([targetUrl], navigationExtras);
    }

    this.showResults = false;
    this.searchQuery = '';
    this.isInteractingWithResults = false;
    this.blurInput();
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    setTimeout(() => {
      if (this.isInteractingWithResults) {
        this.isInteractingWithResults = false;
        return;
      }
      this.showResults = false;
      this.isFocused = false;
    }, 150);
  }

  onResultsPointerDown() {
    this.isInteractingWithResults = true;
  }

  private blurInput() {
    this.searchInput?.nativeElement.blur();
  }

  private resetSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}