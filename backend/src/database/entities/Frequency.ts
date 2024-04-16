import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from "typeorm";
import { Configuration } from "./Configuration";
 
@Entity()
export class Frequency extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    frequency: String;

    @ManyToOne( type => Configuration, configuration => configuration.frequencies) configuration: Configuration;

}