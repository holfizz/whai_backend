import { Injectable } from "@nestjs/common";
import { PaginationInput } from "./dto/pagination.input";

@Injectable()
export class PaginationService {
  getPagination(dto: PaginationInput, defaultPerPage = 30) {
    const page = dto.page ? +dto.page : 1;
    const take = dto.perPage ? +dto.perPage : defaultPerPage;

    const skip = (page - 1) * take;

    return { take, skip };
  }
}
