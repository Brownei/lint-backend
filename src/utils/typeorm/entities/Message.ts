import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Conversation } from './Conversation';
import { MessageAttachment } from './Message-Attachment';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('text', { nullable: true })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @ManyToOne(() => User, (user) => user.messages)
  author: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message)
  @JoinColumn()
  attachments: MessageAttachment[];
}
