import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getJwtConfig } from '../config/jwt.config'
import { PrismaService } from '../prisma.service'
import { JwtStrategy } from './jwt.strategy'
import { UserService } from '../user/user.service'
import { UserModule } from '../user/user.module'

@Module({
	controllers: [AuthController],
	providers: [
		AuthService,
		PrismaService,
		JwtStrategy,
		ConfigService,
		UserService,
	],
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
		UserModule,
	],
})
export class AuthModule {}
