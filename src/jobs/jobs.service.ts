import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose, { Mongoose } from 'mongoose';
import aqp from 'api-query-params';


@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: SoftDeleteModel<JobDocument>
  ) { }
  async create(createJobDto: CreateJobDto, user: IUser) {
    const { name, skills, company, salary, quantity, level, description, startDate, endDate, isActive,location } = createJobDto
    const Newjob = await this.jobModel.create({
      name, skills, company, salary, quantity, level, description, startDate, endDate, isActive,location,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    }
    )
    return {
      _id: Newjob._id,
      createdAt: Newjob.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let tottalPages = +limit ? + limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / tottalPages);

    const result = await this.jobModel.find(filter).
      skip(offset).
      limit(limit).
      sort(sort as any).
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('ID không hợp lệ hoặc không tìm thấy công việc.');
    }
    return await this.jobModel.findById(id)
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const updated = await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found job.";
    }
    else await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.jobModel.softDelete({
      _id: id
    });
  }
}
