import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TinkoffService } from "./tinkoff.service";

@Module({
  imports: [HttpModule.register({}), ConfigModule],
  providers: [TinkoffService],
  exports: [TinkoffService],
})
export class TinkoffModule {}
