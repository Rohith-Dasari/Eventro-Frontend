import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { EventService } from '../../services/event.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Event } from '../../models/events';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  imports: [CommonModule, FormsModule, InputTextModule]
})
export class SearchBarComponent {
  searchQuery = '';
  searchResults: Event[] = [];
  showResults = false;
  selectedCategory: string | null = null;
  searchTerm = new Subject<string>();

  @Input() selectedLocation: any = null;
  @Output() searchTriggered = new EventEmitter<{query: string, category: string | null}>();

  categories = [
    { label: 'Movie', value: 'movie' },
    { label: 'Sports', value: 'sports' },
    { label: 'Concert', value: 'concert' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Party', value: 'party' }
  ];

  constructor(private eventService: EventService, private router: Router) {
    this.searchTerm
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.eventService.searchEventsByName(term))
      )
      .subscribe(results => {
        if (this.selectedCategory) {
          results = results.filter(
            (e: Event) => e.category?.toLowerCase() === this.selectedCategory
          );
        }
        this.searchResults = results;
        this.showResults = results.length > 0;
      });
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    if (!value.trim()) {
      this.showResults = false;
      this.searchResults = [];
      return;
    }
    this.searchTerm.next(value);
    this.searchTriggered.emit({query: value, category: this.selectedCategory});
  }

  selectCategory(category: string) {
    this.selectedCategory =
      this.selectedCategory === category ? null : category;
    if (this.searchQuery.trim()) {
      this.searchTerm.next(this.searchQuery);
      this.searchTriggered.emit({query: this.searchQuery, category: this.selectedCategory});
    }
  }

  selectEvent(event: Event) {
    this.router.navigate([`/dashboard/events/${event.id}`], {
      state: { selectedEvent: event },
    });
    this.showResults = false;
    this.searchQuery = '';
  }
}
