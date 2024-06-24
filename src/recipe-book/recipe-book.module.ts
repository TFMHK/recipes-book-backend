import { Module } from '@nestjs/common';
import { RecipesBookService } from './recipe-book.service';
import { RecipesBookController } from './recipe-book.controller';
import { DatabaseService } from 'src/database/database.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [RecipesBookController],
  providers: [RecipesBookService, DatabaseService],
})
export class RecipesBookModule {}
