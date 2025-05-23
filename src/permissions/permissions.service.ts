import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from './schema/permission.schema';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private PermissionModel: SoftDeleteModel<PermissionDocument>) { }
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const {name,apiPath, method, module} = createPermissionDto
    const isExist = await this.PermissionModel.findOne({apiPath , method})
    if (isExist){
      throw new BadRequestException(`permission voi apiPath =${apiPath}, method ${method} da ton tai`)
    }
    const newPermission = await this.PermissionModel.create({
      name, apiPath, method, module,
      createdBy:{
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newPermission?.id,
      createdAt: newPermission?.createdAt
    }
  }

  async findAll(currentPage: number,limit: number,qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.PermissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.PermissionModel.find(filter)
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
    return await this.PermissionModel.findById(id)
  }

  async update(_id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if(!mongoose.Types.ObjectId.isValid(_id)){
      throw new BadRequestException(" not found permission")
    }
    const { module, method,apiPath, name} = updatePermissionDto;
    const update = await this.PermissionModel.updateOne({_id},
      {
        module, method, apiPath, name,
        updatedBy:{
          _id: user._id,
          email: user.email
        }
      }
    )
    return update
  }

  async remove(id: string, user: IUser) {
    await this.PermissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.PermissionModel.softDelete(
      { _id: id });
  
  }
}
