import { User } from './User';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  liked: boolean;

  @ManyToOne(() => User, (user) => user.like)
  user: User;
}
