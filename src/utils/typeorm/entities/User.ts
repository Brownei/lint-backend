import { Like } from './Like';
import { Post } from './Post';
import { Profile } from './Profile';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as argon2 from 'argon2';
import { Gender } from 'src/modules/users/dto/create-user.dto';
import { Message } from './Message';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @Column()
  birthdayDate: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: 'Male' | 'Female';

  @Column({
    default: '',
  })
  profileImage: string;

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Like, (like) => like.user)
  like: Like[];

  @OneToOne(() => Profile, { cascade: ['insert', 'update'] })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Message, (message) => message.author)
  @JoinColumn()
  messages: Message[];

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
