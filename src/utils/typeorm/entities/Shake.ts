/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shakes')
export class ShakeUser {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    userFollowed: number;

    @Column()
    userId: number;

    constructor(shake: Partial<ShakeUser>) {
        Object.assign(this, shake);
    }
}
