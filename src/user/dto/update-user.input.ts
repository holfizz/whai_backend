import { InputType, PartialType } from "@nestjs/graphql";
import { UserInput } from "./user.input";

@InputType()
export class UpdateUserInput extends PartialType(UserInput) {}
