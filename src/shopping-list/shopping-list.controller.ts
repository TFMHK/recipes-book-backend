import { Controller, Get, Body, UseGuards, Put, Req, Query } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { Ingredient } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    console.log("get:", await this.shoppingListService.findAll(userId), req.user);
    return this.shoppingListService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async replace(@Body() updateShoppingListDto: Array<Ingredient>, @Req() req: AuthenticatedRequest, @Query('ride') ride: boolean) {
    console.log("put:", updateShoppingListDto, req.user);
    const userId = req.user.userId;
    if(ride ?? true)
      return this.shoppingListService.replace(updateShoppingListDto, userId);
    return this.shoppingListService.merge(updateShoppingListDto, userId);
  }
}
