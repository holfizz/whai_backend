import { Injectable } from "@nestjs/common";
import { PaginationInput } from "./dto/pagination.input";

@Injectable()
export class PaginationService {
  getPagination(dto: PaginationInput, defaultTake = 30) {
    const take = dto.take ? +dto.take : defaultTake;
    const skip = dto.skip ? +dto.skip : 0;

    return { take, skip };
  }
}
