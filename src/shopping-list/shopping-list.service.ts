import { Injectable } from '@nestjs/common';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { Ingredient } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ShoppingListService {
  constructor(private databaseService:DatabaseService){}

  async create(createShoppingListDto: CreateShoppingListDto) {
    return 'This action adds a new shoppingList';
  }

  async findAll(userId:string) {
    return this.databaseService.ingredient.findMany({where:{userId:userId}});
  }

  async findOne(id: string) {
    return `This action returns a #${id} shoppingList`;
  }

  async update(id: number, updateShoppingListDto: UpdateShoppingListDto) {
    return `This action updates a #${id} shoppingList`;
  }

  async remove(id: number) {
    return `This action removes a #${id} shoppingList`;
  }

  async replace(ingredients: Ingredient[], userId:string){
    await this.databaseService.ingredient.deleteMany({
      where: {
        userId: userId,
    }});

    for (const ingredient of ingredients) {
      await this.databaseService.ingredient.create({
        data: {
          name: ingredient.name,
          amount: +ingredient.amount,
          userId: userId,
        },
      });
    }

    return this.databaseService.ingredient.findMany({where: {userId: userId}});
  }

  async merge(ingredients: Ingredient[], userId: string) {
    const shoppingList = await this.databaseService.ingredient.findMany({
        where: { userId: userId }
    });
    
    const ingredientMap = new Map<string, Ingredient>();

    shoppingList.forEach(ingredient => {
        ingredientMap.set(ingredient.name, ingredient);
    });

    for (const ingredient of ingredients) {
        if (ingredientMap.has(ingredient.name)) {
            const existingIngredient = ingredientMap.get(ingredient.name);
            existingIngredient.amount += +ingredient.amount;
            ingredientMap.set(ingredient.name, existingIngredient);
        } else {
            ingredientMap.set(ingredient.name, {
                ...ingredient,
                userId: userId
            });
        }
    }

    const mergedIngredients = Array.from(ingredientMap.values());

    for (const ingredient of mergedIngredients) {
        if (ingredient.id) {
            await this.databaseService.ingredient.update({
                where: { id: ingredient.id },
                data: { amount: ingredient.amount }
            });
        } else {
            await this.databaseService.ingredient.create({
                data: ingredient
            });
        }
    }

    return mergedIngredients;
  }
}
