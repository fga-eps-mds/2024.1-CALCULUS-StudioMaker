import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContentController } from 'src/content/content.controller';
import { ContentService } from 'src/content/content.service';
import { Content } from 'src/content/content.schema';
import { UpdateContentsOrderDto } from 'src/content/dtos/update-content-order.dto';

describe('ContentController', () => {
  let controller: ContentController;

  const mockContentService = {
    createContent: jest.fn(),
    findContentById: jest.fn(),
    findAllContents: jest.fn(),
    updateContent: jest.fn(),
    deleteContent: jest.fn(),
    updateContentOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createContent', () => {
    it('should create content', async () => {
      const contentDto = {
        title: 'Test Title',
        content: 'Test Content',
        trailId: 'trail-id',
      };
      const content = {
        _id: 'content-id',
        ...contentDto,
      } as unknown as Content;

      mockContentService.createContent.mockResolvedValue(content);

      const result = await controller.createContent(contentDto);
      expect(result).toEqual(content);
      expect(mockContentService.createContent).toHaveBeenCalledWith(
        contentDto.title,
        contentDto.content,
        contentDto.trailId,
      );
    });

    it('should throw NotFoundException if required fields are missing', async () => {
      const contentDto = { title: '', content: '', trailId: '' };

      await expect(controller.createContent(contentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findContentById', () => {
    it('should return content by id', async () => {
      const content = {
        _id: 'content-id',
        title: 'Test Title',
        content: 'Test Content',
      } as Content;

      mockContentService.findContentById.mockResolvedValue(content);

      const result = await controller.findContentById('content-id');
      expect(result).toEqual(content);
      expect(mockContentService.findContentById).toHaveBeenCalledWith(
        'content-id',
      );
    });

    it('should throw NotFoundException if content is not found', async () => {
      mockContentService.findContentById.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.findContentById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllContents', () => {
    it('should return all contents', async () => {
      const contents = [
        { _id: 'content-id-1', title: 'Title 1', content: 'Content 1' },
        { _id: 'content-id-2', title: 'Title 2', content: 'Content 2' },
      ] as Content[];

      mockContentService.findAllContents.mockResolvedValue(contents);

      const result = await controller.findAllContents();
      expect(result).toEqual(contents);
      expect(mockContentService.findAllContents).toHaveBeenCalled();
    });
  });

  describe('updateContent', () => {
    it('should update content and return the updated content', async () => {
      const content = {
        _id: 'content-id',
        title: 'Updated Title',
        content: 'Updated Content',
      } as Content;

      mockContentService.updateContent.mockResolvedValue(content);

      const updateData = { title: 'Updated Title', content: 'Updated Content' };
      const result = await controller.updateContent('content-id', updateData);
      expect(result).toEqual(content);
      expect(mockContentService.updateContent).toHaveBeenCalledWith(
        'content-id',
        updateData,
      );
    });

    it('should throw NotFoundException if content is not found', async () => {
      mockContentService.updateContent.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.updateContent('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteContent', () => {
    it('should delete content', async () => {
      mockContentService.deleteContent.mockResolvedValue(undefined);

      await expect(
        controller.deleteContent('content-id'),
      ).resolves.not.toThrow();
      expect(mockContentService.deleteContent).toHaveBeenCalledWith(
        'content-id',
      );
    });

    it('should throw NotFoundException if content is not found', async () => {
      mockContentService.deleteContent.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.deleteContent('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateContentOrder', () => {
    it('should update content order', async () => {
      const contentsDto = {
        contents: [
          { _id: 'content-id-1', order: 2 },
          { _id: 'content-id-2', order: 1 },
        ],
      } as UpdateContentsOrderDto;
      const updateResult = { acknowledged: true, modifiedCount: 2 };

      mockContentService.updateContentOrder.mockResolvedValue(updateResult);

      const result = await controller.updateTrailOrder(contentsDto);
      expect(result).toEqual(updateResult);
      expect(mockContentService.updateContentOrder).toHaveBeenCalledWith(
        contentsDto.contents,
      );
    });
  });
});
