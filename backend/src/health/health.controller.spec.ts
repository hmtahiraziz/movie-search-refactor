import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    getHealthStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status from service', () => {
      const expectedResult = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 100,
        environment: 'test',
      };

      mockHealthService.getHealthStatus.mockReturnValue(expectedResult);

      const result = controller.getHealth();
      expect(service.getHealthStatus).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});

