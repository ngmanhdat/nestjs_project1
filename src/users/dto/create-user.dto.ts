import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'name is not empty' })
    name: string;
}

export class CreateUserDto {

    @IsNotEmpty({ message: 'name is not empty' })
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty({ message: 'age is not empty' })
    age: number;

    @IsNotEmpty({ message: 'gender is not empty' })
    gender: string;

    @IsNotEmpty({ message: 'address is not empty' })
    address: string;

    @IsNotEmpty({ message: 'role is not empty' })
    @IsMongoId({message:"co dinh dang mongo id"})
    role: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}

export class RegisterUserDto {

    @IsNotEmpty({ message: 'name is not empty' })
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty({ message: 'age is not empty' })
    age: number;

    @IsNotEmpty({ message: 'gender is not empty' })
    gender: string;

    @IsNotEmpty({ message: 'address is not empty' })
    address: string;
}
// class = {}