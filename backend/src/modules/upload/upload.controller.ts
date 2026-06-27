import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly userService: UserService
  ) {}

  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: '用户上传图片' })  
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '成功上传头像' })
  @ApiResponse({ status: 400, description: '类型错误 仅支持 JPEG, PNG, and GIF 格式.' })
  @ApiResponse({ status: 401, description: '未登录' })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const result = await this.uploadService.uploadAvatar(file);
    // 更新用户头像
    await this.userService.updateAvatar(req.user.id, result.url);
    return result;
  }
}
