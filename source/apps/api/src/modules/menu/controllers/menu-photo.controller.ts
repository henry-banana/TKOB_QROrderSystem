import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MenuPhotoService } from '../services/mene-photo.service';
import { Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from '@/modules/tenant/guards/tenant-ownership.guard';
import { MenuItemPhotoResponseDto, UploadPhotoDto } from '../dto/menu-photo.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Menu - Photos')
@Controller('menu/items/:itemId/photos')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class MenuPhotoController {
  constructor(private readonly photoService: MenuPhotoService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload photo for menu item' })
  @ApiBody({ type: UploadPhotoDto })
  @ApiResponse({ status: 201, type: MenuItemPhotoResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadPhoto(
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MenuItemPhotoResponseDto> {
    if (!file) {
      throw new Error('File is required');
    }
    return this.photoService.uploadPhoto(itemId, file);
  }
}
