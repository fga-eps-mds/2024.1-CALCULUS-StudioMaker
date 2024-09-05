import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PointController } from 'src/start_point/point.controller';
import { PointService } from 'src/start_point/point.service';
import { CreateStartPointDto } from 'src/start_point/dtos/create-start-point.dto';

describe('PointController', () => {
  let controller: PointController;

  const mockPointService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addJourneyToPoint: jest.fn(),
    getJourneysByPointId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [
        {
          provide: PointService,
          useValue: mockPointService,
        },
      ],
    }).compile();

    controller = module.get<PointController>(PointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a point', async () => {
      const createStartPointDto: CreateStartPointDto = {
        name: 'asdas',
        description: 'asdasd',
      };
      const point = {
        _id: 'point-id',
        ...createStartPointDto,
      };

      const token = 'valid-token';
      mockPointService.create.mockResolvedValue(point);

      const result = await controller.create(createStartPointDto, {
        headers: { authorization: `Bearer ${token}` },
      } as any);
      expect(result).toEqual(point);
      expect(mockPointService.create).toHaveBeenCalledWith(
        createStartPointDto,
        token,
      );
    });

    it('should throw UnauthorizedException if token is missing', async () => {
      const createStartPointDto: CreateStartPointDto = {
        name: 'aasd',
        description: 'asda',
      };

      await expect(
        controller.create(createStartPointDto, { headers: {} } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findAll', () => {
    it('should return all points', async () => {
      const points = [{ _id: 'point-id-1' }, { _id: 'point-id-2' }];

      mockPointService.findAll.mockResolvedValue(points);

      const result = await controller.findAll();
      expect(result).toEqual(points);
      expect(mockPointService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return points by user id', async () => {
      const points = [{ _id: 'point-id' }];

      mockPointService.findByUserId.mockResolvedValue(points);

      const result = await controller.findByUser('user-id');
      expect(result).toEqual(points);
      expect(mockPointService.findByUserId).toHaveBeenCalledWith('user-id');
    });
  });

  describe('findById', () => {
    it('should return a point by id', async () => {
      const point = { _id: 'point-id' };

      mockPointService.findById.mockResolvedValue(point);

      const result = await controller.findById('point-id');
      expect(result).toEqual(point);
      expect(mockPointService.findById).toHaveBeenCalledWith('point-id');
    });

    it('should throw NotFoundException if point is not found', async () => {
      mockPointService.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a point and return the updated point', async () => {
      const updateStartPointDto: CreateStartPointDto = {
        name: '',
        description: '',
      };
      const updatedPoint = { _id: 'point-id', ...updateStartPointDto };

      mockPointService.update.mockResolvedValue(updatedPoint);

      const result = await controller.update('point-id', updateStartPointDto);
      expect(result).toEqual(updatedPoint);
      expect(mockPointService.update).toHaveBeenCalledWith(
        'point-id',
        updateStartPointDto,
      );
    });

    it('should throw NotFoundException if point is not found', async () => {
      mockPointService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('invalid-id', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a point', async () => {
      mockPointService.delete.mockResolvedValue(undefined);

      await expect(controller.delete('point-id')).resolves.not.toThrow();
      expect(mockPointService.delete).toHaveBeenCalledWith('point-id');
    });

    it('should throw NotFoundException if point is not found', async () => {
      mockPointService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addJourneyToPoint', () => {
    it('should add a journey to a point', async () => {
      const journeyId = 'journey-id';
      const updatedPoint = { _id: 'point-id', journeyIds: [journeyId] };

      mockPointService.addJourneyToPoint.mockResolvedValue(updatedPoint);

      const result = await controller.addJourneyToPoint('point-id', {
        journeyId,
      });
      expect(result).toEqual(updatedPoint);
      expect(mockPointService.addJourneyToPoint).toHaveBeenCalledWith(
        'point-id',
        journeyId,
      );
    });
  });

  describe('getJourneysByPointId', () => {
    it('should return journeys by point id', async () => {
      const journeys = [
        { _id: 'journey-id-1' /* outros campos */ },
        { _id: 'journey-id-2' /* outros campos */ },
      ];

      mockPointService.getJourneysByPointId.mockResolvedValue(journeys);

      const result = await controller.getJourneysByPointId('point-id');
      expect(result).toEqual(journeys);
      expect(mockPointService.getJourneysByPointId).toHaveBeenCalledWith(
        'point-id',
      );
    });

    it('should throw NotFoundException if point is not found', async () => {
      mockPointService.getJourneysByPointId.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.getJourneysByPointId('invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
