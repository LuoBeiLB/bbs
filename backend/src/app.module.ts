import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ArticleModule } from './modules/article/article.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadModule } from './modules/upload/upload.module';
import { TagModule } from './modules/tag/tag.module';
import * as path from 'path';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局生效，其他模块无需重复导入
      // envFilePath: path.resolve(__dirname, '../../.env'), // 指向项目根目录的 .env 文件
      envFilePath: path.join(process.cwd(), '.env'),
    }),
    // 配置数据库连接
    TypeOrmModule.forRootAsync({
      inject: [ConfigService], // 注入 ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST', 'localhost'), // 第二个参数是默认值
        port: configService.get<number>('DATABASE_PORT', 3306),
        username: configService.get<string>('DATABASE_USERNAME', 'root'),
        password: configService.get<string>('DATABASE_PASSWORD', ''),
        database: configService.get<string>('DATABASE_NAME', 'bishe'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // 生产环境关闭
      }),
    }),

    // 3. JWT 配置：注入 ConfigService，解决读取不到的问题
    JwtModule.registerAsync({
      inject: [ConfigService], // 必须注入 ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // 从 ConfigService 读取
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    // 导入功能模块
    AuthModule,
    UserModule,
    ArticleModule,
    AiModule,
    UploadModule,
    TagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
