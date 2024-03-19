import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Links, Profile, User } from 'src/utils/typeorm';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Links])],
  controllers: [UsersController, ProfileController],
  providers: [UsersService, ProfileService],
  exports: [UsersService, ProfileService],
})
export class UsersModule {}
