import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './user/Guards/jwt-auth.guard';
import { UserModule } from './user/user.module';
import { GeminiModule } from './gemini/gemini.module';
import { PlaningModule } from './planing/planing.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://drabom123:h7dSueLM6gjt3vxs@cluster0.y9nv0up.mongodb.net/bioai?retryWrites=true&w=majority&appName=Cluster0',
    ),
    UserModule,
    GeminiModule,
    PlaningModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
