import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiResponse } from './models/api-response';
import { ShowService } from './show.service';

describe('ShowService', () => {
  let service: ShowService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addShow should POST to shows and map data', () => {
    const payload = {
      event_id: 'event-1',
      venue_id: 'venue-1',
      show_date: '2026-02-11',
      show_time: '19:30',
    } as any;

    const response: ApiResponse<{ id: string }> = {
      message: 'ok',
      status_code: 200,
      data: { id: 'show-1' },
    };

    let actual: { id: string } | undefined;
    service.addShow(payload).subscribe((data) => {
      actual = data;
    });

    const req = httpMock.expectOne('shows');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);

    expect(actual).toEqual({ id: 'show-1' });
  });

  it('blockShow should PATCH to shows/{id} with payload', () => {
    const response: ApiResponse<{ updated: boolean }> = {
      message: 'ok',
      status_code: 200,
      data: { updated: true },
    };

    let actual: { updated: boolean } | undefined;
    service.blockShow('show-9', true).subscribe((data) => {
      actual = data;
    });

    const req = httpMock.expectOne('shows/show-9');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ is_blocked: true });
    req.flush(response);

    expect(actual).toEqual({ updated: true });
  });
});
