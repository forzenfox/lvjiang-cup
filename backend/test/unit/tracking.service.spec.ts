import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from '../../src/modules/tracking/tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingService],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logEvent', () => {
    it('should log an event successfully', () => {
      const eventData = {
        event: 'page_view',
        timestamp: new Date().toISOString(),
        page: '/teams',
      };

      expect(() => service.logEvent(eventData)).not.toThrow();
    });

    it('should handle minimal event data', () => {
      const eventData = {
        event: 'click',
        timestamp: new Date().toISOString(),
      };

      expect(() => service.logEvent(eventData)).not.toThrow();
    });

    it('should handle event with additional data fields', () => {
      const eventData = {
        event: 'form_submit',
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        data: {
          formName: 'create_match',
          fields: ['teamA', 'teamB', 'boFormat'],
        },
      };

      expect(() => service.logEvent(eventData)).not.toThrow();
    });

    it('should handle special characters in event data', () => {
      const eventData = {
        event: '<script>alert("test")</script>',
        timestamp: new Date().toISOString(),
      };

      expect(() => service.logEvent(eventData)).not.toThrow();
    });

    it('should handle very long event data', () => {
      const eventData = {
        event: 'page_view',
        timestamp: new Date().toISOString(),
        page: '/teams/' + 'a'.repeat(1000),
      };

      expect(() => service.logEvent(eventData)).not.toThrow();
    });
  });
});
