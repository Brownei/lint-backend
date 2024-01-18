import { User } from './User';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
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

  @ManyToOne(() => User, (user) => user.post)
  user: User;
}
