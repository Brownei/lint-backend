import { Controller, Post, Param, Get } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { CurrentUser } from 'src/guard/auth.guard';
// import { Public } from 'src/decorators/public.decorator';

@Controller('profile')
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
