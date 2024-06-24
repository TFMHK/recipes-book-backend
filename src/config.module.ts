import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
  ],
})
export class MyConfigModule {}

function configuration() {
  return {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-here',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  };
}