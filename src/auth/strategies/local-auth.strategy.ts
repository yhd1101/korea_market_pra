//검증해주는로직

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', //이메일값을 기준
    });
  }
  //검증되는 함수
  async validate(email: string, password: string): Promise<User> {
    return this.authService.Login({ email, password });
  } //User로 리턴
}
