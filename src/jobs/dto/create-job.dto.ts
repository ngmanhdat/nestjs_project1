
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'name is not empty' })
    name: string;
}

export class CreateJobDto {

    @IsNotEmpty({ message: 'name is not empty' })
    name: string;

    @IsNotEmpty()
    @IsArray({ message: 'skill is not empty' })
    // validate tung phan tu xem co phai dang string khong
    @IsString({each: true, message: 'skill is not empty' })
    skills: string[];

    @IsNotEmpty()
    salary: number;

    @IsNotEmpty({ message: 'quantity is not empty' })
    quantity: number;

    @IsNotEmpty({ message: 'level is not empty' })
    level: string;

    @IsNotEmpty({ message: 'description is not empty' })
    description: string;

    @IsNotEmpty()
    @IsDate()
    @Transform(({value}) => new Date(value))
    startDate: Date;

    @IsNotEmpty()
    @IsDate()
    @Transform(({value}) => new Date(value))
    endDate: Date;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

 
    logo: string;

    @IsNotEmpty()
    location: string
}
