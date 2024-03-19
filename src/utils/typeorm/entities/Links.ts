import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // ManyToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Profile } from './Profile';

@Entity()
export class Links {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  link: string;

  @ManyToOne(() => Profile, (profile) => profile.links)
  @JoinColumn()
  profile: Profile;
}
