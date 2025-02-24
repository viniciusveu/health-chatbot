// logging/src/entities/log.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum LogStatus {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

@Entity()
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('msg_content')
    msgContent: string;

    @Column()
    context: string;

    @Column()
    status: LogStatus;

    @Column()
    msgError: string;

    @CreateDateColumn()
    sent_at: Date;
}