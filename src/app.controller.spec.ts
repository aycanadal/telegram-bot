import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
  });

  describe('getStatus', () => {
    it('should return server status message', () => {
      const appController = app.get(AppController);

      const statusResponseMock = {
        send: jest.fn((x) => x),
      }
      
      const responseMock = {
        status: jest.fn((x) => statusResponseMock),
        send: jest.fn((x) => x),
      } as unknown as Response

      appController.getStatus(responseMock)

      expect(statusResponseMock.send).toHaveBeenCalledWith('Bot server is up.');
    });
  });
});
