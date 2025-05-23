import { Controller, Post, UseGuards, Get, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';

import { Response,Request  } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';


@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService
  ) { }
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage("user login")
  handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user , response);
  }
  
  
  @Public()
  @ResponseMessage("Register a new user")
  @Post('/register')
  handleRegister(@Body() register: RegisterUserDto ) {
    return this.authService.register(register);
  }

  @ResponseMessage("Get user information")
  @Get('/account')
  async handleGetAccount(@User() user: IUser) {
    const temp = await this.rolesService.findOne(user.role._id) as any;
    user.permissions = temp.permission;
    return {user};
  }
  
  @Public()
  @ResponseMessage("Get User by refresh token")
  @Get('/refresh')
  handleRefreshToken(@Req() request: Request,@Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies["refreshtoken"];

    return this.authService.ProcessToken(refreshToken,response);

  }

  @ResponseMessage("logout user")
  @Post('/logout')
  handleLogout(@Res({ passthrough: true }) response: Response,@User() user: IUser) {
    return this.authService.logout(response,user);
  }


}
