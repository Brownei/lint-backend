import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/modules/users/services/users.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm';
import { UsersModule } from 'src/modules/users/users.module';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { FacebookStrategy } from 'src/strategies/facebook.strategy';
import { SessionSerializer } from 'src/guard/serializer';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    UsersService,
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
    SessionSerializer,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
