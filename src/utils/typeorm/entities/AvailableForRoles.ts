import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from './Profile';

@Entity()
export class AvailableForRoles {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  rolesActiveFor: string;

  @ManyToMany(() => Profile)
  @JoinColumn()
  profile: Profile[];
}
