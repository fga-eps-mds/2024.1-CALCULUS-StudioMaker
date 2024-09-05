import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrailController } from 'src/trail/trail.controller';
import { TrailService } from 'src/trail/trail.service';

describe('TrailController', () => {
  let controller: TrailController;

  const mockTrailService = {
    createTrail: jest.fn(),
    findTrailById: jest.fn(),
    findAllTrails: jest.fn(),
    updateTrail: jest.fn(),
    addContentToTrail: jest.fn(),
    removeContentFromTrail: jest.fn(),
    deleteTrail: jest.fn(),
    updateTrailOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrailController],
      providers: [
        {
          provide: TrailService,
          useValue: mockTrailService,
        },
      ],
    }).compile();

    controller = module.get<TrailController>(TrailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTrail', () => {
    it('should create a trail', async () => {
      const trailData = { name: 'Test Trail', journeyId: 'journey-id' };
      mockTrailService.createTrail.mockResolvedValue('trail-created');

      const result = await controller.createTrail(trailData);
      expect(result).toEqual('trail-created');
      expect(mockTrailService.createTrail).toHaveBeenCalledWith(
        trailData.name,
        trailData.journeyId,
      );
    });

    it('should throw NotFoundException if journeyId is not provided', async () => {
      const trailData = { name: 'Test Trail', journeyId: '' };

      await expect(controller.createTrail(trailData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTrailById', () => {
    it('should return a trail by id', async () => {
      const trailId = 'trail-id';
      mockTrailService.findTrailById.mockResolvedValue('trail');

      const result = await controller.getTrailById(trailId);
      expect(result).toEqual('trail');
    });
  });

  describe('getAllTrails', () => {
    it('should return all trails', async () => {
      mockTrailService.findAllTrails.mockResolvedValue(['trail1', 'trail2']);

      const result = await controller.getAllTrails();
      expect(result).toEqual(['trail1', 'trail2']);
    });
  });

  describe('updateTrail', () => {
    it('should update a trail', async () => {
      const trailId = 'trail-id';
      const updateData = { name: 'Updated Trail' };
      mockTrailService.updateTrail.mockResolvedValue('updated-trail');

      const result = await controller.updateTrail(trailId, updateData);
      expect(result).toEqual('updated-trail');
    });
  });

  describe('addContentToTrail', () => {
    it('should add content to a trail', async () => {
      const trailId = 'trail-id';
      const contentData = { contentId: 'content-id' };
      mockTrailService.addContentToTrail.mockResolvedValue('content-added');

      const result = await controller.addContentToTrail(trailId, contentData);
      expect(result).toEqual('content-added');
    });

    it('should throw NotFoundException if contentId is not provided', async () => {
      const trailId = 'trail-id';
      const contentData = { contentId: '' };

      await expect(
        controller.addContentToTrail(trailId, contentData),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeContentFromTrail', () => {
    it('should remove content from a trail', async () => {
      const trailId = 'trail-id';
      const contentData = { contentId: 'content-id' };
      mockTrailService.removeContentFromTrail.mockResolvedValue(
        'content-removed',
      );

      const result = await controller.removeContentFromTrail(
        trailId,
        contentData,
      );
      expect(result).toEqual('content-removed');
    });
  });

  describe('deleteTrail', () => {
    it('should delete a trail', async () => {
      const trailId = 'trail-id';
      mockTrailService.deleteTrail.mockResolvedValue(null);

      const result = await controller.deleteTrail(trailId);
      expect(result).toEqual({ message: 'Trail deleted successfully' });
      expect(mockTrailService.deleteTrail).toHaveBeenCalledWith(trailId);
    });
  });

  describe('updateTrailOrder', () => {
    it('should update trail orders in bulk', async () => {
      const trails = [
        { _id: '1', order: 2 },
        { _id: '2', order: 1 },
      ];
      const bulkWriteResult = { acknowledged: true, modifiedCount: 2 };

      mockTrailService.updateTrailOrder.mockResolvedValue(bulkWriteResult);

      const result = await controller.updateTrailOrder({ trails });
      expect(result).toEqual(bulkWriteResult);
      expect(mockTrailService.updateTrailOrder).toHaveBeenCalledWith(trails);
    });
  });
});
