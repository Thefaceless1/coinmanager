import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import * as bcrypt from 'bcrypt'
import {CoinEntity} from "./coin.entity";
import {PurchasesEntity} from "./purchases.entity";
import {StakingEntity} from "./staking.entity";

@Entity({name: "users",orderBy: {id: "ASC"}})
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  login: string

  @Column()
  email: string

  @Column({select: false})
  password: string

  @CreateDateColumn({
    name: "create_date",
    type: "timestamptz"
  })
  createDate: Date

  @ManyToMany(() => CoinEntity,{cascade: true})
  @JoinTable({
    name: "users_coins",
    joinColumn: {
      name: "user_id"
    },
    inverseJoinColumn: {
      name: "coin_id"
    }})
  coins: CoinEntity[]

  @OneToMany(() => PurchasesEntity, purchase => purchase.id, {cascade: true})
  purchases: PurchasesEntity[]

  @OneToMany(() => StakingEntity, staking => staking.id,{cascade: true})
  staking: StakingEntity[]

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password,10);
  }
}