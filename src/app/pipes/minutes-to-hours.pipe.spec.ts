import { MinutesToHoursPipe } from './minutes-to-hours.pipe';

describe('MinutesToHoursPipe', () => {
  let pipe: MinutesToHoursPipe;

  beforeEach(() => {
    pipe = new MinutesToHoursPipe();
  });

  it('returns an empty string for null or undefined', () => {
    expect(pipe.transform(null as unknown as number)).toBe('');
    expect(pipe.transform(undefined as unknown as number)).toBe('');
  });

  it('formats minutes into hours with one decimal', () => {
    expect(pipe.transform(0)).toBe('0.0h');
    expect(pipe.transform(30)).toBe('0.5h');
    expect(pipe.transform(90)).toBe('1.5h');
  });
});
