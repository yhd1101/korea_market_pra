import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //전체 불러오기
  @Get()
  async getAllUser() {
    const users = await this.userService.userGetAll();
    return users;
  }
  //회원가입하기
  @Post('/signup')
  async postSignup(@Body() createUserDto: CreateUserDto) {
    const newSignup = await this.userService.createUser(createUserDto);
    return newSignup;
  }

  @Get('id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    return user;
  }
}
