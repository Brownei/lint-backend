import {
  Controller,
  Post,
  Param,
  Get,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { CurrentUser } from '../../auth/guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';
// import { Public } from 'src/decorators/public.decorator';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createNewProfile(
    @CurrentUser('email') email: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return await this.profileService.createProfile(createProfileDto, email);
  }

  @Get('/:userName')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(
    @CurrentUser('email') email: string,
    @Param('userName') userName: string,
  ) {
    // console.log(email, userName);
    return await this.profileService.getProfile(userName, email);
  }

  @Get('post/:id')
  @UseGuards(FirebaseAuthGuard)
  async getProfileThroughId(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) profileId: number,
  ) {
    return await this.profileService.getProfileThroughId(profileId, userId);
  }
}
