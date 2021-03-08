import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  edited: boolean;

  @CreateDateColumn()
  createdDate: Date;

  @ManyToOne((type) => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  constructor(text: string, user: User) {
    this.text = text;
    this.user = user;
    this.edited = false;
  }
}
