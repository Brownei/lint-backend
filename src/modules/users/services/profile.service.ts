import { Injectable } from '@nestjs/common';
import { Profile, Links } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UserAlreadyExistsException } from 'src/utils/exceptions/UserAlreadyExist';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Links)
    private readonly linkRepository: Repository<Links>,
  ) {}

  async createProfile(profileDTO: CreateProfileDto) {
    const profile = new Profile();
    const existingProfile = await this.profileRepository.findOne({
      where: {
        username: profile.username,
      },
    });

    if (existingProfile) throw new UserAlreadyExistsException();

    for (const profileLink in profileDTO.links) {
      const newLink = new Links();
      newLink.link = profileLink;
      await this.linkRepository.save(newLink);
    }

    profile.bio = profileDTO.bio;
    profile.location = profileDTO.location;
    profile.occupation = profileDTO.occupation;
    profile.profileImage = profileDTO.profileImage;
    profile.username = profileDTO.username;
    profile.links = profileDTO.links;
    profile.user = profileDTO.user;

    const user = await this.userRepository.findOneBy({
      id: profileDTO.user.id,
    });

    await this.userRepository.save(user);

    await this.profileRepository.save(profile);

    return profile;
  }

  //GET MY PROFILE
  async getProfile(username: string, userId: number) {
    const currentProfile = await this.profileRepository.findOne({
      where: {
        username,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...otherDetails } = currentProfile;

    if (id !== userId) {
      return otherDetails;
    }

    return currentProfile;
  }
}
