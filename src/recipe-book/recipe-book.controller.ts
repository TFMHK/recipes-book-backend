import { Controller, Get, Query, UseGuards, Req, Post, Body } from '@nestjs/common';
import { RecipesBookService } from './recipe-book.service';
import { OptionalAuthGuard } from 'src/auth/jwt/optional-jwt-auth.guard';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

@Controller('recipe-book')
@UseGuards(OptionalAuthGuard)
export class RecipesBookController {
  constructor(private readonly recipesBookService: RecipesBookService) {}

  @Get()
  async findAll(@Query('search') search: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user ? req.user.userId : null;
    if (search) {
      return this.recipesBookService.search(search, userId);
    } else {
      return this.recipesBookService.findAll(userId);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async add(@Body() data, @Query('commentOrRate') commentOrRate: string, @Req() req: AuthenticatedRequest){
      const userId = req.user.userId;
      if(commentOrRate === 'comment')
        return this.addComment(data,userId);
      else
        return this.addRating(data,userId);
  }

  private addRating({rating, recipe}, userId:string){
    return this.recipesBookService.addRating(rating, recipe, userId);
  }

  private addComment({comment, recipe}, userId:string){
    return this.recipesBookService.addComment(comment, recipe, userId);
  }
}