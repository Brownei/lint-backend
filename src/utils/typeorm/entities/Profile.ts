/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Links } from './Links';
import { Post } from './Post';
import { User } from './User';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
        unique: true,
    })
    username: string;

    @Column({
        nullable: false
    })
    occupation: string;

    @Column({
        nullable: false
    })
    location: string;

    @Column({
        nullable: false
    })
    bio: string;

    @OneToMany(() => Links, (link) => link.profile)
    @JoinColumn()
    links: Links[]
    
    @Column({
        default: '',
    })
    profileImage: string;

    @OneToMany(() => Post, (post) => post.user)
    post: Post[];

    @OneToOne(() => User, (user) => user.profile)
    @JoinColumn()
    user: User;

    // constructor(profile: Partial<Profile>) {
    //     Object.assign(this, profile);
    // }
}
