import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from '../../src/modules/tracking/tracking.controller';
import { TrackingService } from '../../src/modules/tracking/tracking.service';

describe('TrackingController', () => {
  let controller: TrackingController;
  let service: TrackingService;

  const mockTrackingService = {
    logEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [{ provide: TrackingService, useValue: mockTrackingService }],
    }).compile();

    controller = module.get<TrackingController>(TrackingController);
    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleTrackingEvent', () => {
    it('should track an event and return success', () => {
      const eventData = {
        event: 'page_view',
        timestamp: new Date().toISOString(),
        page: '/teams',
      };

      mockTrackingService.logEvent.mockReturnValue(undefined);

      const result = controller.handleTrackingEvent(eventData as any);

      expect(result).toEqual({ success: true });
      expect(service.logEvent).toHaveBeenCalled();
    });

    it('should handle minimal event data', () => {
      const eventData = {
        event: 'click',
        timestamp: new Date().toISOString(),
      };

      mockTrackingService.logEvent.mockReturnValue(undefined);

      const result = controller.handleTrackingEvent(eventData as any);

      expect(result).toEqual({ success: true });
    });

    it('should handle event with additional fields', () => {
      const eventData = {
        event: 'form_submit',
        timestamp: new Date().toISOString(),
        userId: 'user_123',
      };

      mockTrackingService.logEvent.mockReturnValue(undefined);

      const result = controller.handleTrackingEvent(eventData as any);

      expect(result).toEqual({ success: true });
      expect(service.logEvent).toHaveBeenCalled();
    });
  });
});
