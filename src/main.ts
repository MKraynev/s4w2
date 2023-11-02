import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ngrok from "ngrok"


const ngrokConnect = async() =>{
  let url = await ngrok.connect()
  console.log(url);
  return url;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  
  await app.listen(80);

  await ngrokConnect();
}
bootstrap();
