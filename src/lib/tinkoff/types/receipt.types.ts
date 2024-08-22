import { TinkoffItemDto } from "../dto/tinkoff.dto";

export interface ICustomer {
  full_name?: string;
  inn?: string;
  email?: string;
  phone?: string;
}

export interface IReceipt {
  customer?: ICustomer;
  items: TinkoffItemDto[];
  tax_system_code?: any;
}
