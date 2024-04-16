import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Frequency } from "./Frequency";
import { Configuration } from "./Configuration"

@Entity()
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: String;

    @Column()
    type: String;

    @ManyToOne(type => Configuration, configuration => configuration.roles) configuration: Configuration;

    @ManyToMany(type => Frequency) @JoinTable()
    frequencies: Frequency[];

}