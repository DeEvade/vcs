import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  JoinTable,
  Unique,
} from "typeorm";

@Entity()
export class XC extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { array: true })
  frequencyIds: number[];
}
