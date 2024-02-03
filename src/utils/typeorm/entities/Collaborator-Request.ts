import {
  Column,
  Entity,
  OneToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity('collaborator-requests')
export class CollaboratorRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  sender: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  receiver: User;

  @ManyToOne(() => Post, (post) => post.requests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: Post;

  @CreateDateColumn()
  createdAt: number;

  @Column()
  status: 'accepted' | 'pending' | 'rejected';
}
