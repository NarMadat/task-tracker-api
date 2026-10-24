import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import { HealthController } from './health.controller';

describe('HealthController (Unit)', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).to.be.ok;
  });

  describe('getHealth', () => {
    it('should return health status, uptime, timestamp and service name', () => {
      const result = controller.getHealth();
      expect(result).to.have.property('status', 'ok');
      expect(result).to.have.property('service', 'nestjs-devops-api');
      expect(result).to.have.property('uptime').that.is.a('number');
      expect(result).to.have.property('timestamp').that.is.a('string');
    });
  });

  describe('getLiveness', () => {
    it('should return liveness probe status', () => {
      const result = controller.getLiveness();
      expect(result).to.deep.equal({
        status: 'ok',
        probe: 'liveness',
      });
    });
  });

  describe('getReadiness', () => {
    it('should return readiness probe status', () => {
      const result = controller.getReadiness();
      expect(result).to.deep.equal({
        status: 'ok',
        probe: 'readiness',
      });
    });
  });
});
