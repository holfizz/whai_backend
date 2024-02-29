import { applyDecorators, UseGuards } from "@nestjs/common";
import { TypeRole } from "../auth.interface";
import { OnlyAdminGuard } from "../guards/admin.guard";
import { GqlAuthGuard } from "../guards/gql-jwt.guard";
import { JwtAuthGuard } from "../guards/jwt.guard";

export const Auth = (role: TypeRole) =>
  applyDecorators(
    role === "admin" ? UseGuards(JwtAuthGuard, OnlyAdminGuard) : UseGuards(GqlAuthGuard), // Используем GqlAuthGuard для всех ролей
  );
