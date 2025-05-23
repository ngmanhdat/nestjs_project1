import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService
  ) { }
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUser(username);
    if (user) {
      const IsValid = this.usersService.IsValidPassword(pass, user.password);
      if (IsValid === true) {
        const userRole = user.role as unknown as {_id: string;name: string};
        const temp = await this.rolesService.findOne(userRole._id);
        const objUser = {
          ...user.toObject(),
          permissions: temp?.permission ?? []
        }
        return objUser;
      }
    }
    return null;
  }
  async register(Register: RegisterUserDto) {
    let newUser = await this.usersService.register(Register)
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }

  }


  async login(user: IUser, response: Response) {
    const { _id, name, email, role ,permissions } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      name,
      email,
      role
    };
    const refresh_token = this.createRefreshToken(payload);
    //update user token
    await this.usersService.updateUserToken(refresh_token, _id)
    //set cookie
    response.cookie('refreshtoken', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>("JWT_EXPIRE_EXPIRE")) * 1000,
    })
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      user: {
        _id,
        name,
        email,
        role,
        permissions
      }
    };

  }
  createRefreshToken = (payload: any) => {
    const reftoke = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_TOKEN"),
      expiresIn: ms(this.configService.get<string>("JWT_EXPIRE_EXPIRE")) / 1000,
    });
    return reftoke
  }
  ProcessToken = async (refreshToken: string,response :Response) => {
    try {
      this.jwtService.verify(refreshToken,
        { secret: this.configService.get<string>("JWT_REFRESH_TOKEN") })
      let user = await this.usersService.FindUserByRefreshToken(refreshToken)
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: "token refresh",
          iss: "from server",
          _id,
          name,
          email,
          role
        };
        const refresh_token = this.createRefreshToken(payload);
        //update user token
        await this.usersService.updateUserToken(refresh_token, _id.toString())
        const  userRole = user.role as unknown as {_id: string ;name : string}
        const temp = await this.rolesService.findOne(userRole._id)
        //set cookie
        response.clearCookie('refreshtoken1');
        response.cookie('refreshtoken1', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>("JWT_EXPIRE_EXPIRE")) * 1000,
        })
        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            Permissions : temp?.permission ?? []
          }
        };

      } else {
        throw new BadRequestException("khong tim thay user")
      }
    } catch (error) {
      throw new BadRequestException("refresh Token khong hop le , vui long login lai")

    }
  }

  logout = async (response: Response,user: IUser) => {
    await this.usersService.updateUserToken("",user._id);
    response.clearCookie('refreshtoken');
    return "ok"
  }


}
