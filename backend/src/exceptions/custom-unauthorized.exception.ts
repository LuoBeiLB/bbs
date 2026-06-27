
import { UnauthorizedException } from '@nestjs/common';

// 自定义未授权异常，扩展错误码和描述
export class CustomUnauthorizedException extends UnauthorizedException {
  constructor(
    message: string = 'Invalid refresh token',
    public errorCode: string = 'INVALID_TOKEN', // 自定义错误码
  ) {
    super({ message, errorCode });
  }
}