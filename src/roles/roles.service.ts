import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schema/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private RoleModel: SoftDeleteModel<RoleDocument>) { }
  async create(createRoleDto: CreateRoleDto,user: IUser) {
    const {name,description,isActive,permission} = createRoleDto;
    const checkExist = await this.RoleModel.findOne({name})
    if(checkExist){
      throw new BadRequestException("ten da ton tai")
    }
    const create = await this.RoleModel.create({
      name,description, isActive, permission,
      createdBy:{
        _id: user._id,
        email: user.email
      }
    }
    )
    return {
      _id: create?._id,
      createdAt: create?.createdAt
    }
  }

  async findAll(currentPage: number,limit: number,qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.RoleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.RoleModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)){
      throw new BadRequestException(`not found ${id}`)
    }
    const role = await this.RoleModel.findById(id).populate('permissions')
    console.log(">>> Role populated:", role);
    return role;
  }

  async update(_id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if(!mongoose.Types.ObjectId.isValid(_id)){
      throw new BadRequestException(" not found Role")
    }
    const { description, isActive,permission, name} = updateRoleDto;
    const update = await this.RoleModel.updateOne({_id},
      {
        description, isActive, permission, name,
        updatedBy:{
          _id: user._id,
          email: user.email
        }
      }
    )
    return update
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.RoleModel.findById(id)
    if(foundRole.name === ADMIN_ROLE){
      throw new BadRequestException("khong the xoa admin")
    }
    await this.RoleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.RoleModel.softDelete(
      { _id: id });
  
  }
}
