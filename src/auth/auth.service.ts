import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from './tokenPayload.interface';
import { EmailService } from '../email/email.service';
import { raw } from 'express';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { ConfirmEmailDto } from '../user/dto/confirm-email.dto';
import { Cache } from 'cache-manager';
import { verificationEmail } from '../common/template/verificationEmail';
import { ChangePasswordDto } from '../user/dto/change-password.dto'; //확인 잘하기

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManger: Cache,
  ) {}

  //회원가입
  async createUser(createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    user.password = undefined; //패스워드 가려줌
    await this.emailService.sendMail({
      to: createUserDto.email,
      subject: '이메일확인',
      text: 'welcome',
    });
    return user;
  }

  async Login(loginUserDto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(loginUserDto.email);
    const isPasswordMatched = await user.validatePassword(
      loginUserDto.password,
    );
    if (!isPasswordMatched) {
      throw new HttpException(
        'Password do not matched',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.password = undefined;
    return user;
  }

  //access 토큰생성 함수
  public generateAccessToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESSTOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get('ACCESSTOKEN_EXPIRATION_TIME')}m`,
    });
    return token;
  }

  async sendEmail(email: string) {
    const generateNumber = this.generateOTP();
    await this.cacheManger.set(email, generateNumber);
    await this.emailService.sendMail({
      to: email,
      subject: '이메일확인',
      html: verificationEmail(generateNumber),
    });
    return 'success';
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
    const emailCodeByRedis = await this.cacheManger.get(confirmEmailDto.email);
    if (emailCodeByRedis !== confirmEmailDto.code) {
      throw new BadRequestException('Wrong code provided');
    }
    await this.cacheManger.del(confirmEmailDto.email);
    return true;
  }

  async forgotPassword(email: string) {
    await this.emailService.sendMail({
      to: email,
      subject: 'forgot password',
      text: `패스워드 변경하려면 아래 버튼을 눌러주세요,`,
    });
    return true;
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {}

  //랜덤함수
  generateOTP() {
    let OTP = '';
    for (let i = 1; i <= 6; i++) {
      OTP += Math.floor(Math.random() * 10);
    }
    return OTP;
  }
}
