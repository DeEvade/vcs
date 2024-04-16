import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable, ManyToOne, OneToMany } from "typeorm";
import { Frequency } from "./Frequency";
import { Configuration } from "./Configuration"
import { RoleFrequency } from "./RoleFrequency";

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

    @OneToMany(type => RoleFrequency, roleFrequency => roleFrequency.role) roleFrequency: RoleFrequency;

}