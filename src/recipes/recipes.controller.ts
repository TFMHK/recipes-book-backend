import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.recipesService.create(createRecipeDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    console.log("get:", await this.recipesService.findAll(userId), req.user);
    return this.recipesService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.recipesService.findOne(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.recipesService.update(+id, updateRecipeDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.recipesService.remove(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  replace(@Body() updateRecipeListDto: Array<CreateRecipeDto>, @Req() req: AuthenticatedRequest, @Query('ride') ride: boolean) {
    console.log("put:", updateRecipeListDto, req.user);
    const userId = req.user.userId;
    if(ride ?? true)
      return this.recipesService.replace(updateRecipeListDto, userId);
      return this.recipesService.merge(updateRecipeListDto, userId);
  }
}