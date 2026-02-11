import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService();
  });

  it('defaults to noida', () => {
    expect(service.getCity()).toBe('noida');
  });

  it('normalizes and updates city', () => {
    service.setCity(' Hyderabad ');
    expect(service.getCity()).toBe('hyderabad');
  });

  it('falls back to default when city is empty', () => {
    service.setCity('');
    expect(service.getCity()).toBe('noida');
  });
});
