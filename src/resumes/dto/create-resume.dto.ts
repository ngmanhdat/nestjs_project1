import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsNotEmpty({message: `email khong duoc de trong`})
    email: string;

    @IsNotEmpty({message: `userId khong duoc de trong`})
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({message: `url khong duoc de trong`})
    url: string;

    @IsNotEmpty({message: `status khong duoc de trong`})
    status: string;    

    @IsNotEmpty({message: `companyId khong duoc de trong`})
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({message: `jobId khonf duoc de trong`})
    jobId: mongoose.Schema.Types.ObjectId;

}
export class CreateCvDto{
    @IsNotEmpty({message: `url khong duoc de trong`})
    url : string;

    @IsNotEmpty({message: `companyId khong duoc de trong`})
    @IsMongoId()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({message: `jobId khonf duoc de trong`})
    @IsMongoId()
    jobId: mongoose.Schema.Types.ObjectId;
}