import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, JoinTable } from "typeorm";
import { Frequency } from "./Frequency";
import { Role } from "./Role";

@Entity()
export class Configuration extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Frequency, frequency => frequency.configuration) frequency: Frequency[];

    @OneToMany(type => Role, role => role.configuration) roles: Configuration[];
}