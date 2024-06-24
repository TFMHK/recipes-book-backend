import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { DatabaseService } from 'src/database/database.service';
import { IngredientDto } from './dto/ingredient.dto';

@Injectable()
export class RecipesService {
  recipeList = [];

  constructor(private readonly databaseService:DatabaseService){}

  async create(createRecipeDto: CreateRecipeDto, userId?: string) {
    return 'This action adds a new recipe';
  }

  async findAll(userId?: string) {
    const recipes = await this.databaseService.recipe.findMany({
      include:{ ingredients:true, permissions: true, recipeRating: true, comments: true }
    });

    return recipes.filter(r => {
      if (!userId) return r.visible;
      return r.visible || r.authorId === userId || !!r.permissions.find(p => p.userId === userId);
    })
      .map(
        v => new CreateRecipeDto(
          v.id,
          v.name,
          v.description,
          v.directions,
          v.imagePath,
          v.ingredients.map(
            i => new IngredientDto(
              i.id,
              i.name,
              i.amount
            )
          ),
          v.visible
        )
      );
  }

  async findOne(id: number, userId?: string) {
    return `This action returns a #${id} recipe`;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto, userId?: string) {
    return `This action updates a #${id} recipe`;
  }

  async remove(id: number, userId?: string) {
    return `This action removes a #${id} recipe`;
  }

  async replace(updateRecipeList: CreateRecipeDto[], userId?: string){
    await this.databaseService.ingredient.deleteMany({
      where: {
        recipe: {
          authorId: userId,
        },
      },
    });
    await this.databaseService.recipe.deleteMany({
      where: {
        authorId: userId,
      },
    });
    
    for (const recipe of updateRecipeList) {
      const createdRecipe = await this.databaseService.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          directions: recipe.directions,
          imagePath: recipe.imagePath,
          visible: recipe.visible ?? true,
          authorId: userId,
        },
      });

      for (const ingredient of <IngredientDto[]>recipe.ingredients) {
        await this.databaseService.ingredient.create({
          data: {
            name: ingredient.name,
            amount: ingredient.amount,
            recipeId: createdRecipe.id,
          },
        });
      }

      for (const permission of recipe.permissions) {
        await this.databaseService.permissions.create({
          data: {
            userId: (await this.databaseService.user.findUnique({where:{username:permission.username}})).id,
            recipeId: createdRecipe.id,
            permission: permission.permission
          },
        });
      }
    }

    return this.databaseService.recipe.findMany({
      where: {
        authorId: userId,
      },
      include: {
        ingredients: true,
      },
    });
  }

  async merge(updateRecipeList: CreateRecipeDto[], userId?: string) {
    const existingRecipeIds = updateRecipeList.map((recipe) => recipe.id);
  
    await this.databaseService.ingredient.deleteMany({
      where: {
        recipe: {
          authorId: userId,
          id: {
            notIn: existingRecipeIds,
          },
        },
      },
    });
    await this.databaseService.recipe.deleteMany({
      where: {
        authorId: userId,
        id: {
          notIn: existingRecipeIds,
        },
      },
    });
  
    for (const recipe of updateRecipeList) {
      const existingRecipe = await this.databaseService.recipe.findUnique({
        where: { id: recipe.id },
      });
  
      if (existingRecipe) {
        await this.databaseService.recipe.update({
          where: { id: recipe.id },
          data: {
            name: recipe.name,
            description: recipe.description,
            directions: recipe.directions,
            imagePath: recipe.imagePath,
            visible: recipe.visible ?? true,
            updatedAt: new Date(),
          },
        });
  
        await this.databaseService.ingredient.deleteMany({
          where: {
            recipeId: recipe.id,
          },
        });
  
        for (const ingredient of recipe.ingredients) {
          await this.databaseService.ingredient.create({
            data: {
              name: ingredient.name,
              amount: ingredient.amount,
              recipeId: recipe.id,
            },
          });
        }

        for (const permission of recipe.permissions) {
          await this.databaseService.permissions.create({
            data: {
              userId: (await this.databaseService.user.findUnique({where:{username:permission.username}})).id,
              recipeId: recipe.id,
              permission: permission.permission
            },
          });
        }
      } else {
        const createdRecipe = await this.databaseService.recipe.create({
          data: {
            name: recipe.name,
            description: recipe.description,
            directions: recipe.directions,
            imagePath: recipe.imagePath,
            visible: recipe.visible ?? true,
            authorId: userId,
          },
        });
  
        for (const ingredient of recipe.ingredients) {
          await this.databaseService.ingredient.create({
            data: {
              name: ingredient.name,
              amount: ingredient.amount,
              recipeId: createdRecipe.id,
            },
          });
        }

        for (const permission of recipe.permissions) {
          await this.databaseService.permissions.create({
            data: {
              userId: (await this.databaseService.user.findUnique({where:{username:permission.username}})).id,
              recipeId: recipe.id,
              permission: permission.permission
            },
          });
        }
      }
    }
  
    return this.databaseService.recipe.findMany({
      where: {
        authorId: userId,
      },
      include: {
        ingredients: true,
      },
    });
  }  
}