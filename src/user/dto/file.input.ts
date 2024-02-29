import { Field, InputType } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
@InputType()
export class FileInput {
  @Field(type => GraphQLUpload, { nullable: true })
  picture?: FileUpload;
}
