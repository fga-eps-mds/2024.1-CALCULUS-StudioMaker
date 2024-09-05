import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';
import { PointService } from 'src/start_point/point.service';

describe('PointService', () => {
  let service: PointService;
  let mockPointModel: any;
  let mockHttpService: any;

  beforeEach(async () => {
    mockPointModel = {
      create: jest.fn().mockImplementation((dto) => dto),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
    };

    mockHttpService = {
      get: jest.fn(),
      patch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: getModelToken('Point'),
          useValue: mockPointModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<PointService>(PointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(service, 'validateTokenAndGetUserId').mockResolvedValue(null);

      await expect(
        service.create(
          { name: 'Test Point', description: 'Description' },
          'invalid-token',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update a point and return the updated point', async () => {
      const updateStartPointDto = {
        name: 'Updated Test Point',
        description: 'Updated Description',
      };
      const updatedPoint = { _id: 'point-id', ...updateStartPointDto };
      mockPointModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(updatedPoint),
      });

      const result = await service.update('point-id', updateStartPointDto);

      expect(result).toEqual(updatedPoint);
      expect(mockPointModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'point-id',
        updateStartPointDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if point does not exist', async () => {
      mockPointModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('invalid-point-id', {
          name: '',
          description: '',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addJourneyToPoint', () => {
    it('should throw NotFoundException if point does not exist', async () => {
      mockPointModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.addJourneyToPoint('invalid-point-id', 'journey-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getJourneysByPointId', () => {
    it('should return an array of journey IDs associated with a point', async () => {
      const point = {
        _id: 'point-id',
        name: 'Test Point',
        journeys: ['journey-id'],
      };
      mockPointModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(point),
      });

      const result = await service.getJourneysByPointId('point-id');

      expect(result).toEqual(['journey-id']);
      expect(mockPointModel.findById).toHaveBeenCalledWith('point-id');
    });

    it('should throw NotFoundException if point does not exist', async () => {
      mockPointModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getJourneysByPointId('invalid-point-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of points', async () => {
      const points = [{ name: 'Test Point', description: 'Description' }];
      mockPointModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(points),
      });

      const result = await service.findAll();
      expect(result).toEqual(points);
      expect(mockPointModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a point by id', async () => {
      const point = {
        _id: 'point-id',
        name: 'Test Point',
        description: 'Description',
      };
      mockPointModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(point),
      });

      const result = await service.findById('point-id');
      expect(result).toEqual(point);
      expect(mockPointModel.findById).toHaveBeenCalledWith('point-id');
    });

    it('should throw NotFoundException if point does not exist', async () => {
      mockPointModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid-point-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a point and return it', async () => {
      const point = {
        _id: 'point-id',
        name: 'Test Point',
        description: 'Description',
      };
      mockPointModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(point),
      });

      const result = await service.delete('point-id');
      expect(result).toEqual(point);
      expect(mockPointModel.findByIdAndDelete).toHaveBeenCalledWith('point-id');
    });

    it('should throw NotFoundException if point does not exist', async () => {
      mockPointModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('invalid-point-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateTokenAndGetUserId', () => {
    it('should return userId if token is valid', async () => {
      const token = 'valid-token';
      mockHttpService.get.mockReturnValue(
        of({ data: { userPayload: { id: 'valid-user-id' } } }),
      );

      const userId = await service.validateTokenAndGetUserId(token);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${process.env.AUTH_SERVICE_URL}/validate-token`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      expect(userId).toBe('valid-user-id');
    });

    it('should return null if token is invalid', async () => {
      const token = 'invalid-token';
      mockHttpService.get.mockReturnValue(of({ data: {} }));

      const userId = await service.validateTokenAndGetUserId(token);

      expect(userId).toBeNull();
    });
  });
});
