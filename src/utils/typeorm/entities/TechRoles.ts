import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from './Profile';

@Entity()
export class TechRoles {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  roles: string;

  @ManyToMany(() => Profile)
  @JoinColumn()
  profile: Profile[];
}
