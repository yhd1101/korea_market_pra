import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';

@Entity()
export class Product extends CommonEntity {
  @Column()
  public name: string;

  @Column()
  public desc: string;

  @Column()
  public price: number;
}
