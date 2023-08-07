import { BeforeInsert, Column, Entity } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import * as bcrypt from 'bcryptjs';
import { Provider } from './provider.enum';
import * as gravatar from 'gravatar';

import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';

@Entity() // 스키마생성해줌
export class User extends CommonEntity {
  @Column()
  public name: string;
  @Column()
  public email: string;
  @Column({ nullable: true })
  public password?: string;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.LOCAL,
  })
  public provider: Provider; //Provider에 있는 4개중 하나만 골라야함

  @Column({ nullable: true })
  public profileImg?: string;
  @BeforeInsert() //데이터 넣기전에 실행하는 함수
  async beforeSaveFunction(): Promise<void> {
    try {
      if (this.provider !== Provider.LOCAL) {
        return;
      } else {
        //패스워드 암호화
        const saltValue = await bcrypt.genSalt(10); //암호화되는 키값
        this.password = await bcrypt.hash(this.password, saltValue);

        //프로필 이미지 자동생성
        this.profileImg = await gravatar.url(this.email, {
          s: '200',
          r: 'pg',
          d: 'mm',
          protocol: 'https',
        });
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  //로그인할때 패스워드 인증
  async validatePassword(aPassword: string) {
    try {
      const isPasswordMatch = await bcrypt.compare(aPassword, this.password);
      return isPasswordMatch;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.CONFLICT);
    }
  }
}
