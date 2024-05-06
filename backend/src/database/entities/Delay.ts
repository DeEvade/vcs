import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from "typeorm";
import { Pilot } from "./Pilot";

@Entity()
export class Delay extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    delayValue: number;
  
    // @OneToOne(() => Pilot)
    // @JoinColumn()
    // pilot: Pilot;
  }