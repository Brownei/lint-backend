import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from './Profile';

@Entity()
export class Skills {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Profile)
  @JoinColumn()
  profile: Profile[];
}
