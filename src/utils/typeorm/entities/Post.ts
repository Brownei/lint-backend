import { CollaboratorRequest } from './Collaborator-Request';
import { Profile } from './Profile';
import { User } from './User';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  techStacks: string;

  @Column()
  problem: string;

  @Column()
  solution: string;

  @Column()
  requirements: string;

  @Column()
  isPaid: boolean;

  @OneToMany(() => CollaboratorRequest, (request) => request.post)
  @JoinColumn()
  requests: CollaboratorRequest[];

  @ManyToOne(() => Profile, (profile) => profile.post)
  profile: Profile;

  @ManyToOne(() => User, (user) => user.post)
  user: User;
}
