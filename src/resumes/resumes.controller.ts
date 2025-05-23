import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateCvDto,  } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage("Create a new resume")
  create(@Body() CreateCvDto: CreateCvDto, @User() user: IUser) {
    console.log("a")
    return this.resumesService.create(CreateCvDto, user);
  }

  @Get()
  @ResponseMessage("get all")
  findAll(
    @Query("Current") currentPage: string,
    @Query("PageSize") limit: string,
    @Query() qs: string

  ) {
    return this.resumesService.findAll(+currentPage,+limit,qs);
  }

  @Get(':id')
  @ResponseMessage("find by id")
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update status resume")
  update(@Param('id') id: string, @Body("status") status: string, @User() user: IUser) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage("DeleteDelete a resume")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id,user);
  }

  @Post('by-user')
  @ResponseMessage("Get resume by user")
  getResumeByUser(@User() user:IUser){
    return this.resumesService.findByUsers(user);
  }
}
