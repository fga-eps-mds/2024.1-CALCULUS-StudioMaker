import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { Content } from './content.schema';
import { UpdateContentsOrderDto } from './dtos/update-content-order.dto';

@Controller('contents')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async createContent(
    @Body() body: { title: string; content: string; trailId: string },
  ): Promise<Content> {
    const { title, content, trailId } = body;

    if (!title || !content || !trailId) {
      throw new NotFoundException('Title, content, and trailId are required');
    }

    return this.contentService.createContent(title, content, trailId);
  }

  @Get(':id')
  async findContentById(@Param('id') id: string): Promise<Content> {
    return this.contentService.findContentById(id);
  }

  @Get()
  async findAllContents(): Promise<Content[]> {
    return this.contentService.findAllContents();
  }

  @Get('trail/:id')
  async findContentsByTrailId(@Param('id') id: string): Promise<Content[]> {
    return this.contentService.findContentsByTrailId(id);
  }

  @Patch(':id')
  async updateContent(
    @Param('id') id: string,
    @Body() updateData: Partial<Content>,
  ): Promise<Content> {
    return this.contentService.updateContent(id, updateData);
  }

  @Delete(':id')
  async deleteContent(@Param('id') id: string): Promise<void> {
    return this.contentService.deleteContent(id);
  }

  @Patch('order/update-order')
  async updateTrailOrder(@Body() contentsDto: UpdateContentsOrderDto) {
    this.logger.log(
      `Updating trail order for the list: ${JSON.stringify(contentsDto.contents)}`,
    );
    const result = await this.contentService.updateContentOrder(
      contentsDto.contents,
    );
    return result;
  }
}
