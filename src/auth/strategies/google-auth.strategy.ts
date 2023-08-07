import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import { ConfigService } from '@nestjs/config';
import { VerifyCallback } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { use } from 'passport';
import { Provider } from '../../user/entities/provider.enum';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('GOOGLE_AUTH_CLIENTID'),
      clientSecret: configService.get('GOOGLE_AUTH_CLIENTSECRET'),
      callbackURL: configService.get('GOOGLE_AUTH_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, email, provider, picture } = profile;
    const userInput = {
      name: displayName,
      email,
      provider,
      picture,
    };
    try {
      const user = await this.userService.getUserByEmail(email);
      //로그인 처리
      if (user.provider !== provider) {
        throw new HttpException(
          `You are already subscribed to ${user.provider}`,
          HttpStatus.CONFLICT,
        );
      }
      done(null, user);
    } catch (err) {
      //이메일이 없으면 회원가입
      if (err.status === 404) {
        const newUser = await this.userService.createUser({
          email,
          name: displayName,
          provider,
          profileImg: picture,
        });
        done(null, newUser);
      }
    }
  }
}
