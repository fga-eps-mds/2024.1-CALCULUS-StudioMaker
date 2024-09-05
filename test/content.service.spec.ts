import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ContentService } from 'src/content/content.service';
import { TrailService } from 'src/trail/trail.service';
import { Types } from 'mongoose';
import { ContentInterface } from 'src/content/dtos/update-content-order.dto';

describe('ContentService', () => {
  let service: ContentService;

  const mockContentModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    bulkWrite: jest.fn(),
  };

  const mockTrailModel = {
    findById: jest.fn(),
  };

  const mockTrailService = {
    addContentToTrail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getModelToken('Content'),
          useValue: mockContentModel,
        },
        {
          provide: getModelToken('Trail'),
          useValue: mockTrailModel,
        },
        {
          provide: TrailService,
          useValue: mockTrailService,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContent', () => {
    it('should throw NotFoundException if trail does not exist', async () => {
      const contentDto = {
        title: 'Test Title',
        content: 'Test Content',
        trailId: 'invalid-trail-id',
      };

      mockTrailModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.createContent(
          contentDto.title,
          contentDto.content,
          contentDto.trailId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findContentById', () => {
    it('should return content by id', async () => {
      const content = {
        _id: 'content-id',
        title: 'Test Title',
        content: 'Test Content',
      };
      mockContentModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(content),
      });

      const result = await service.findContentById('content-id');
      expect(result).toEqual(content);
      expect(mockContentModel.findById).toHaveBeenCalledWith('content-id');
    });

    it('should throw NotFoundException if content does not exist', async () => {
      mockContentModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findContentById('invalid-content-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllContents', () => {
    it('should return all contents', async () => {
      const contents = [
        { _id: 'content-id', title: 'Test Title', content: 'Test Content' },
      ];
      mockContentModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(contents),
      });

      const result = await service.findAllContents();
      expect(result).toEqual(contents);
      expect(mockContentModel.find).toHaveBeenCalled();
    });
  });

  describe('updateContent', () => {
    it('should update content and return the updated content', async () => {
      const content = {
        _id: 'content-id',
        title: 'Updated Title',
        content: 'Updated Content',
      };
      mockContentModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(content),
      });

      const result = await service.updateContent('content-id', {
        title: 'Updated Title',
        content: 'Updated Content',
      });
      expect(result).toEqual(content);
      expect(mockContentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'content-id',
        { title: 'Updated Title', content: 'Updated Content' },
        { new: true },
      );
    });

    it('should throw NotFoundException if content does not exist', async () => {
      mockContentModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateContent('invalid-content-id', { title: 'Updated Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteContent', () => {
    it('should delete content', async () => {
      mockContentModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.deleteContent('content-id');
      expect(mockContentModel.findByIdAndDelete).toHaveBeenCalledWith(
        'content-id',
      );
    });

    it('should throw NotFoundException if content does not exist', async () => {
      mockContentModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteContent('invalid-content-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateContentOrder', () => {
    it('should update content order for multiple contents', async () => {
      const contents: ContentInterface[] = [
        { _id: '605c72ef8c7e2a001f6e3e2e', order: 2 },
        { _id: '605c72ef8c7e2a001f6e3e2f', order: 1 },
      ];
      const bulkWriteResult = { acknowledged: true, modifiedCount: 2 };

      mockContentModel.bulkWrite.mockResolvedValue(bulkWriteResult);

      const result = await service.updateContentOrder(contents);
      expect(result).toEqual(bulkWriteResult);
      expect(mockContentModel.bulkWrite).toHaveBeenCalledWith([
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

    it('should handle empty content list', async () => {
      const contents: ContentInterface[] = [];
      const bulkWriteResult = { acknowledged: true, modifiedCount: 0 };

      mockContentModel.bulkWrite.mockResolvedValue(bulkWriteResult);

      const result = await service.updateContentOrder(contents);
      expect(result).toEqual(bulkWriteResult);
      expect(mockContentModel.bulkWrite).toHaveBeenCalledWith([]);
    });
  });
});
