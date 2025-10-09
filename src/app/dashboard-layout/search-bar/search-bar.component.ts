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
  isFocused = false;
  searchQuery = '';
  searchResults: Event[] = [];
  showResults = false;
  selectedCategory: string | null = null;
  private searchTerm = new Subject<string>();

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
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap(term => this.eventService.searchEventsByName(term,this.selectedCategory))
      )
      .subscribe(results => {
        console.log('Search results:', results);
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
  }

  selectCategory(category: string) {
    this.selectedCategory =
      this.selectedCategory === category ? null : category;
    if (this.searchQuery.trim()) this.searchTerm.next(this.searchQuery);
  }

  selectEvent(event: any) {
    this.router.navigate([`/dashboard/events/${event.id}`], {
      state: { selectedEvent: event },
    });
    this.showResults = false;
    this.searchQuery = '';
  }

}