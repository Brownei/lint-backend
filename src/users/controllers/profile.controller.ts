import { Controller, Post, Param, Get, Body } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { CurrentUser } from '../../auth/guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateProfileDto } from '../dto/create-profile.dto';
// import { Public } from 'src/decorators/public.decorator';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async createNewProfile(
    @CurrentUser('id') userId: number,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return await this.profileService.createProfile(createProfileDto, userId);
  }

  @Get(':userName')
  async getProfile(
    @CurrentUser('id') id: number,
    @Param('userName') userName: string,
  ) {
    return await this.profileService.getProfile(userName, id);
  }
}
