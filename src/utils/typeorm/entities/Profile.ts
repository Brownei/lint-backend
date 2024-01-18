/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;
}
