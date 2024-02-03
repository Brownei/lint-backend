import { Controller, Post, Param, Get } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { CurrentUser } from 'src/guard/auth.guard';
import { Routes } from 'src/utils/constants';
import { ApiTags } from '@nestjs/swagger';
// import { Public } from 'src/decorators/public.decorator';

@ApiTags(Routes.PROFILE)
@Controller(Routes.PROFILE)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post(':firstName/shake')
  async shakeAndUnshakeUser(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
  ) {
    return await this.profileService.shakeAndUnshakeAUser(firstName, userId);
  }

  @Get(':firstName')
  async getProfile(
    @CurrentUser('id') id: number,
    @Param('firstName') firstName: string,
  ) {
    return await this.profileService.getProfile(firstName, id);
  }
}
