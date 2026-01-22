import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ArticleModule } from './modules/article/article.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // 配置数据库连接
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'tech_community',
      autoLoadEntities: true,
      synchronize: true, // 在开发环境中使用，生产环境应关闭
    }),
    
    // 配置 JWT 模块
    JwtModule.register({
      secret: 'your-secret-key', // 在生产环境中应使用环境变量
      signOptions: {
        expiresIn: '1h',
      },
    }),
    
    // 导入功能模块
    AuthModule,
    UserModule,
    ArticleModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
