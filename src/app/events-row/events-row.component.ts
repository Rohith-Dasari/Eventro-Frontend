import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Event } from '../models/events';

@Component({
  selector: 'app-events-row',
  imports: [CommonModule, CardModule],
  templateUrl: './events-row.component.html',
  styleUrl: './events-row.component.scss'
})
export class EventsRowComponent {
  @Input() title: string = 'Events';
  @Input() events: Event[] = [];
  @Input() defaultImage: string = './images/hp3.jpg';
  @Output() eventClick = new EventEmitter<Event>();

  onEventClick(event: Event) {
    this.eventClick.emit(event);
  }
}
