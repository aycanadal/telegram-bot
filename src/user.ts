import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    telegramId: number;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    password: string;

    @Column()
    createdAt: Date;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ nullable: true })
    token: string;

}