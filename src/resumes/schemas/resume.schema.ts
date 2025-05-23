import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Job } from 'src/jobs/schemas/job.schema';

export type ResumeDocument = HydratedDocument<Resume>;
@Schema({timestamps: true})
export class Resume {
    @Prop()
    email: string;
  
    @Prop()
    userId: string;
  
    @Prop()
    url: string;
  
    @Prop()
    status: string;
  
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Company.name })
    companyId: mongoose.Schema.Types.ObjectId;
  
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Job.name })
    jobId: mongoose.Schema.Types.ObjectId;
  
  
    @Prop({type :mongoose.Schema.Types.Array })
    history: {
      status: string;
      updatedAt: Date;
      updatedBy:{
        _id: mongoose.Schema.Types.ObjectId;
        email: string
      }
    }[];
  
    @Prop({ type: Object })
    createdBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
  
    @Prop({ type: Object })
    upddatedBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
    @Prop({ type: Object })
    deletedBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;
  
    @Prop()
    isDeleted: boolean;
  
    @Prop()
    DeletedAt: Date;
  
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);