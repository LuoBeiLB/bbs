import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(__dirname, '../../../uploads');

  constructor() {
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadAvatar(file: Express.Multer.File): Promise<{ url: string }> {
    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!file || !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('类型错误 仅支持 JPEG, PNG, and GIF 格式.');
    }

    // 验证文件大小（最大2MB）
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小超过 2MB 限制.');
    }

    // 生成唯一的文件名
    const fileName = `avatar-${Date.now()}-${Math.round(Math.random() * 10000)}.${file.originalname.split('.').pop()}`;
    const filePath = path.join(this.uploadDir, fileName);

    // 保存文件
    try {
      fs.writeFileSync(filePath, file.buffer);
      // 返回文件的URL路径
      return { url: `/uploads/${fileName}` };
    } catch (error) {
      throw new BadRequestException('文件上传失败.');
    }
  }
}
