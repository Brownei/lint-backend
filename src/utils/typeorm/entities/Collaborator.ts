/* eslint-disable prettier/prettier */
import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';


@Entity('collaborators')
export class Collaborator {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    sender: User;

    @OneToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn()
    receiver: User;

    @CreateDateColumn()
    createdAt: number;
}
