import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly defaultCity = 'noida';
  private readonly citySubject = new BehaviorSubject<string>(this.defaultCity);

  readonly city$ = this.citySubject.asObservable();

  setCity(city: string | null | undefined): void {
    const normalized = (city ?? '').trim().toLowerCase();
    this.citySubject.next(normalized || this.defaultCity);
  }

  getCity(): string {
    return this.citySubject.getValue();
  }
}
