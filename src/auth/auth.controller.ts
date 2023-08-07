import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUserInterface } from './requestWithUser.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfirmEmailDto } from '../user/dto/confirm-email.dto';
import { ChangePasswordDto } from '../user/dto/change-password.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async userSignup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }
  //메일 보내기
  @Post('send/email')
  async sendEmail(@Body('email') email: string) {
    return await this.authService.sendEmail(email);
  }

  @Post('confirm/email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return await this.authService.confirmEmail(confirmEmailDto);
  }
  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard) // guard에서 검증
  async userLogin(@Req() req: RequestWithUserInterface) {
    const user = req.user;
    const token = await this.authService.generateAccessToken(user.id);
    return { token, user };
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getUserInfoByToken(@Req() req: RequestWithUserInterface) {
    const { user } = req;
    user.password = undefined;
    return user;
  }

  @Post('forgot/password') //비밀번호 재설정을위한 메일전송
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Post('change/password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(changePasswordDto);
  }

  //구글에 접속하는 코드(로그인요청)
  @HttpCode(200)
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  //요청을 받고 구글에서 던져주는 정보를 아래 api에 받겠다
  @HttpCode(200)
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallBack(@Req() req: any): Promise<any> {
    //token 생성
    const { user } = req;
    const token = await this.authService.generateAccessToken(user.id);
    return { token, user };
  }
}
