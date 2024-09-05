import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JourneyController } from 'src/journey/journey.controller';
import { JourneyService } from 'src/journey/journey.service';
import { CreateJourneyDto } from 'src/journey/dtos/create-journey.dto';
import { UpdateJourneysOrderDto } from 'src/journey/dtos/updateJourneyOrder';

describe('JourneyController', () => {
  let controller: JourneyController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: JourneyService;

  const mockJourneyService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPointId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addTrailToJourney: jest.fn(),
    updateOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneyController],
      providers: [
        {
          provide: JourneyService,
          useValue: mockJourneyService,
        },
      ],
    }).compile();

    controller = module.get<JourneyController>(JourneyController);
    service = module.get<JourneyService>(JourneyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a journey', async () => {
      const createJourneyDto: CreateJourneyDto = {
        pointId: 'point-id',
        title: 'asd',
        description: 'asad',
      };
      const result = { id: 'journey-id', ...createJourneyDto };

      mockJourneyService.create.mockResolvedValue(result);

      expect(await controller.create(createJourneyDto)).toEqual(result);
      expect(mockJourneyService.create).toHaveBeenCalledWith(
        createJourneyDto,
        createJourneyDto.pointId,
      );
    });

    it('should throw NotFoundException if pointId is missing', async () => {
      const createJourneyDto: CreateJourneyDto = {
        pointId: '',
        title: 'asdasd',
        description: 'asdasd',
      };

      await expect(controller.create(createJourneyDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all journeys', async () => {
      const result = [{ id: 'journey-id' }];

      mockJourneyService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockJourneyService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByPointId', () => {
    it('should return journeys by pointId', async () => {
      const result = [{ id: 'journey-id' }];

      mockJourneyService.findByPointId.mockResolvedValue(result);

      expect(await controller.findByPointId('point-id')).toEqual(result);
      expect(mockJourneyService.findByPointId).toHaveBeenCalledWith('point-id');
    });
  });

  describe('findById', () => {
    it('should return journey by id', async () => {
      const result = { id: 'journey-id' };

      mockJourneyService.findById.mockResolvedValue(result);

      expect(await controller.findById('journey-id')).toEqual(result);
      expect(mockJourneyService.findById).toHaveBeenCalledWith('journey-id');
    });

    it('should throw NotFoundException if journey not found', async () => {
      mockJourneyService.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a journey and return the updated journey', async () => {
      const updateJourneyDto: CreateJourneyDto = {
        pointId: 'point-id',
        title: 'asdasd',
        description: 'asdsad',
      };
      const result = { id: 'journey-id', ...updateJourneyDto };

      mockJourneyService.update.mockResolvedValue(result);

      expect(await controller.update('journey-id', updateJourneyDto)).toEqual(
        result,
      );
      expect(mockJourneyService.update).toHaveBeenCalledWith(
        'journey-id',
        updateJourneyDto,
      );
    });

    it('should throw NotFoundException if journey not found', async () => {
      mockJourneyService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('invalid-id', {} as CreateJourneyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a journey', async () => {
      mockJourneyService.delete.mockResolvedValue(undefined);

      await expect(controller.delete('journey-id')).resolves.not.toThrow();
      expect(mockJourneyService.delete).toHaveBeenCalledWith('journey-id');
    });

    it('should throw NotFoundException if journey not found', async () => {
      mockJourneyService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addTrailToJourney', () => {
    it('should add a trail to the journey', async () => {
      const result = { id: 'journey-id', trailId: 'trail-id' };

      mockJourneyService.addTrailToJourney.mockResolvedValue(result);

      expect(
        await controller.addTrailToJourney('journey-id', {
          trailId: 'trail-id',
        }),
      ).toEqual(result);
      expect(mockJourneyService.addTrailToJourney).toHaveBeenCalledWith(
        'journey-id',
        'trail-id',
      );
    });
  });

  describe('updateTrailOrder', () => {
    it('should update the order of journeys', async () => {
      const updateJourneysOrderDto: UpdateJourneysOrderDto = {
        journeys: [{ _id: 'journey-id', order: 1 }],
      };
      const result = [{ _id: 'journey-id', order: 1 }];

      mockJourneyService.updateOrder.mockResolvedValue(result);

      expect(await controller.updateTrailOrder(updateJourneysOrderDto)).toEqual(
        result,
      );
      expect(mockJourneyService.updateOrder).toHaveBeenCalledWith(
        updateJourneysOrderDto.journeys,
      );
    });
  });
});
