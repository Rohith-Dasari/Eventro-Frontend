import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';
import { LocationService } from './location.service';
import { ApiResponse } from '../models/api-response';

class MockLocationService {
  getCity() {
    return 'noida';
  }
}

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: LocationService, useClass: MockLocationService }],
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests unblocked events with city filter', () => {
    service.getEvents().subscribe();

    const req = httpMock.expectOne((request) => request.url === 'events');
    expect(req.request.params.get('city')).toBe('noida');
    expect(req.request.params.get('is_blocked')).toBe('false');
    req.flush({
      message: 'ok',
      status_code: 200,
      data: [],
    } as ApiResponse<any>);
  });

  it('requests blocked events with city filter', () => {
    service.getBlockedEvents().subscribe();

    const req = httpMock.expectOne((request) => request.url === 'events');
    expect(req.request.params.get('is_blocked')).toBe('true');
    req.flush({
      message: 'ok',
      status_code: 200,
      data: [],
    } as ApiResponse<any>);
  });

  it('searches events with category and city', () => {
    service.searchEventsByName('concert', 'music', true).subscribe();

    const req = httpMock.expectOne((request) => request.url === 'events');
    expect(req.request.params.get('name')).toBe('concert');
    expect(req.request.params.get('category')).toBe('music');
    expect(req.request.params.get('city')).toBe('noida');
    req.flush({
      message: 'ok',
      status_code: 200,
      data: [],
    } as ApiResponse<any>);
  });

  it('adds events', () => {
    const payload = { name: 'Event', category: 'movie' } as any;
    service.addEvent(payload).subscribe();

    const req = httpMock.expectOne('events');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      message: 'ok',
      status_code: 200,
      data: {},
    } as ApiResponse<any>);
  });
});
