import {
  Controller,
  Post,
  Param,
  Get,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { CurrentUser } from '../../auth/guard/auth.guard';
import { CreateProfileDto } from '../dto/create-profile.dto';
// import { Public } from 'src/decorators/public.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post()
  async createNewProfile(
    @CurrentUser('email') email: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return await this.profileService.createProfile(createProfileDto, email);
  }

  @Get('/:username')
  async getProfile(
    @CurrentUser('email') email: string,
    @Param('username') username: string,
  ) {
    // console.log(email, userName);
    return await this.profileService.getProfile(username, email);
  }

  @Get('post/:id')
  async getProfileThroughId(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) profileId: number,
  ) {
    return await this.profileService.getProfileThroughId(profileId, userId);
  }

  @Get('/me')
  async getProfileThroughEmail(@CurrentUser('email') email: string) {
    return await this.profileService.getProfileThroughUserEmail(email);
  }
}
