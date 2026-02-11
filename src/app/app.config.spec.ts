import { MessageService } from 'primeng/api';
import { appConfig } from './app.config';

describe('app config', () => {
  it('defines providers', () => {
    expect(appConfig.providers).toBeDefined();
    expect((appConfig.providers || []).length).toBeGreaterThan(0);
  });

  it('includes MessageService', () => {
    const providers = appConfig.providers || [];
    const hasMessageService = providers.includes(MessageService as any);

    expect(hasMessageService).toBe(true);
  });
});
