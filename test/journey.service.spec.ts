import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { JourneyService } from 'src/journey/journey.service';
import { PointService } from 'src/start_point/point.service';
import { HttpService } from '@nestjs/axios';
import { Types } from 'mongoose';
import { CreateJourneyDto } from 'src/journey/dtos/create-journey.dto';
import { JourneyInterface } from 'src/journey/dtos/updateJourneyOrder';

describe('JourneyService', () => {
  let service: JourneyService;

  const mockJourneyModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    exec: jest.fn(),
    create: jest.fn(),
    bulkWrite: jest.fn(),
  };

  const mockPointModel = {
    findById: jest.fn(),
  };

  const mockPointService = {
    addJourneyToPoint: jest.fn(),
  };

  const mockHttpService = {} as HttpService;

  const mockJourneyInstance = {
    save: jest.fn(),
    _id: 'journey-id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyService,
        {
          provide: getModelToken('Journey'),
          useValue: {
            ...mockJourneyModel,
            prototype: mockJourneyInstance,
          },
        },
        {
          provide: getModelToken('Point'),
          useValue: mockPointModel,
        },
        {
          provide: PointService,
          useValue: mockPointService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<JourneyService>(JourneyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if point does not exist', async () => {
      const createJourneyDto: CreateJourneyDto = {
        title: 'Test Journey',
        description: 'Test Description',
        pointId: 'invalid-point-id',
      };

      mockPointModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.create(createJourneyDto, createJourneyDto.pointId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all journeys', async () => {
      const journeys = [{ _id: 'journey-id', title: 'Test Journey' }];
      mockJourneyModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(journeys),
      });

      const result = await service.findAll();
      expect(result).toEqual(journeys);
      expect(mockJourneyModel.find).toHaveBeenCalled();
    });
  });

  describe('findByPointId', () => {
    it('should return journeys by point ID', async () => {
      const journeys = [{ _id: 'journey-id', title: 'Test Journey' }];
      mockJourneyModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(journeys),
      });

      const result = await service.findByPointId('point-id');
      expect(result).toEqual(journeys);
      expect(mockJourneyModel.find).toHaveBeenCalledWith({ point: 'point-id' });
    });
  });

  describe('findById', () => {
    it('should return journey by ID', async () => {
      const journey = { _id: 'journey-id', title: 'Test Journey' };
      mockJourneyModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(journey),
      });

      const result = await service.findById('journey-id');
      expect(result).toEqual(journey);
      expect(mockJourneyModel.findById).toHaveBeenCalledWith('journey-id');
    });

    it('should throw NotFoundException if journey does not exist', async () => {
      mockJourneyModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('invalid-journey-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the journey', async () => {
      const updateJourneyDto: CreateJourneyDto = {
        title: 'Updated Journey',
        description: 'asdasdad',
      };
      const updatedJourney = { _id: 'journey-id', ...updateJourneyDto };

      mockJourneyModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(updatedJourney),
      });

      const result = await service.update('journey-id', updateJourneyDto);
      expect(result).toEqual(updatedJourney);
      expect(mockJourneyModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'journey-id',
        updateJourneyDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if journey does not exist', async () => {
      mockJourneyModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('invalid-journey-id', {
          title: 'Updated Journey',
          description: 'asdadsa',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete and return the journey', async () => {
      const journey = { _id: 'journey-id' };
      mockJourneyModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(journey),
      });

      const result = await service.delete('journey-id');
      expect(result).toEqual(journey);
      expect(mockJourneyModel.findByIdAndDelete).toHaveBeenCalledWith(
        'journey-id',
      );
    });

    it('should throw NotFoundException if journey does not exist', async () => {
      mockJourneyModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('invalid-journey-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addTrailToJourney', () => {
    describe('addTrailToJourney', () => {
      it('should throw NotFoundException if journey does not exist', async () => {
        mockJourneyModel.findById.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        });

        const invalidTrailId = new Types.ObjectId().toHexString();

        await expect(
          service.addTrailToJourney('invalid-journey-id', invalidTrailId),
        ).rejects.toThrow(NotFoundException);
      });
    });

    it('should throw NotFoundException if journey does not exist', async () => {
      mockJourneyModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.addTrailToJourney('invalid-journey-id', 'trail-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrder', () => {
    it('should update journey order for multiple journeys', async () => {
      const journeys: JourneyInterface[] = [
        { _id: '605c72ef8c7e2a001f6e3e2e', order: 2 },
        { _id: '605c72ef8c7e2a001f6e3e2f', order: 1 },
      ];
      const bulkWriteResult = { acknowledged: true, modifiedCount: 2 };

      mockJourneyModel.bulkWrite.mockResolvedValue(bulkWriteResult);

      const result = await service.updateOrder(journeys);
      expect(result).toEqual(bulkWriteResult);
      expect(mockJourneyModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: new Types.ObjectId('605c72ef8c7e2a001f6e3e2e') },
            update: { $set: { order: 2 } },
          },
        },
        {
          updateOne: {
            filter: { _id: new Types.ObjectId('605c72ef8c7e2a001f6e3e2f') },
            update: { $set: { order: 1 } },
          },
        },
      ]);
    });

    it('should handle empty journey list', async () => {
      const journeys: JourneyInterface[] = [];
      const bulkWriteResult = { acknowledged: true, modifiedCount: 0 };

      mockJourneyModel.bulkWrite.mockResolvedValue(bulkWriteResult);

      const result = await service.updateOrder(journeys);
      expect(result).toEqual(bulkWriteResult);
      expect(mockJourneyModel.bulkWrite).toHaveBeenCalledWith([]);
    });
  });
});
