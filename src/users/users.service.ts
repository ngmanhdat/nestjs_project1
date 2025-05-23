import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schema/user.schema';
import mongoose from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { USER_ROLE } from 'src/databases/sample';
import { Role,RoleDocument } from 'src/roles/schema/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private UserModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name) private RoleModel: SoftDeleteModel<RoleDocument>
) { }
  GethashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;

  }
  async create(tenbien: CreateUserDto, @User() User: IUser) {
    const {
      name, email, password, age, gender, address, role, company
    } = tenbien;
    // check if user already exists
    const isExit = await this.UserModel.findOne({ email });
    if (isExit) {
      throw new BadRequestException(`email ${email} da ton tai`)
    }
    const hashPassword = this.GethashPassword(tenbien.password)
    let user = await this.UserModel.create({
      name, email, password, age, gender, address, role, company,
      createdBy: {
        _id: User._id,
        email: User.email
      }
    })
    return user;
  }
  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    // check if user already exists
    const isExit = await this.UserModel.findOne({ email });
    if (isExit) {
      throw new BadRequestException(`email ${email} da ton tai`)
    }
    const userRole = await this.RoleModel.findOne({name: USER_ROLE})
    const hashPassword = await this.GethashPassword(password)
    let newUser = await this.UserModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: userRole?._id
    })
    return newUser;
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let tottalPages = +limit ? + limit : 10;

    const totalItems = (await this.UserModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / tottalPages);

    const result = await this.UserModel.find(filter).
      skip(offset).
      limit(limit).
      sort(sort as any).
      select("-password").
      populate(population).
      exec();
    return {
      meta: {
        current: currentPage,
        pagesize: limit,
        pages: totalPages,
        total: totalItems

      },
      result
    }
  }

  findOne(username: string) {
    return this.UserModel.findOne({
      email: username
    }).populate({path:"role",select:{name:1}})
  }
  findOneByUser(username: string) {
    return this.UserModel.findOne({
      email: username
    }).populate({path:"role",select:{name:1 , permissions: 1}})
  }

  IsValidPassword(password: string, hash: string) {
    return compareSync(password, hash)
  }
  async update(updateUserDto: UpdateUserDto, @User() user: IUser) {
    const updated = await this.UserModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return updated;
  }

  async remove(id: string, @User() user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return "not found user.";
    const foundUser = await this.UserModel.findById(id);
    if(foundUser && foundUser.email=== "tess5514@gmail.com"){
      throw new BadRequestException("khong the xoa tai khoan admin")
    }
    await this.UserModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.UserModel.softDelete({
      _id: id
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.UserModel.updateOne(
      { _id },
      { refreshToken }
    )
  }
  FindUserByRefreshToken = async (refreshToken: string) => {
    return await this.UserModel.findOne({refreshToken}).populate({
      path: "role",
      select: {name: 1}
    })
  }
}
