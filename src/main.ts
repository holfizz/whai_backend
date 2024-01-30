import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'

const start = async () => {
  const app = await NestFactory.create(AppModule)
  const PORT = process.env.PORT || 7700
  app.setGlobalPrefix('api')
  app.enableCors()
  await app.listen(PORT, () => {
    console.log(`server started on PORT ${PORT}`)
  })
}
start()
