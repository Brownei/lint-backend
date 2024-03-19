import { Like } from './Like';
import { Post } from './Post';
import { Profile } from './Profile';
import {
  // BeforeInsert,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './Message';
// import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  fullName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  emailVerified: boolean;

  @Column({
    default: '',
  })
  profileImage: string;

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Like, (like) => like.user)
  like: Like[];

  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Message, (message) => message.author)
  @JoinColumn()
  messages: Message[];

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
