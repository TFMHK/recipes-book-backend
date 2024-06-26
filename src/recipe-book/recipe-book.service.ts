import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CommentDto } from 'src/recipes/dto/comment.dto';
import { CreateRecipeDto } from 'src/recipes/dto/create-recipe.dto';
import { IngredientDto } from 'src/recipes/dto/ingredient.dto';
import { PermissionDto } from 'src/recipes/dto/permission.dto';

@Injectable()
export class RecipesBookService {
  recipeList = [];

  constructor(private readonly databaseService:DatabaseService){}

  async findAll(userId?:string) {
    const recipes = await this.databaseService.recipe.findMany({
      include:{ ingredients:true, permissions: true, recipeRating: true, comments: true }
    });

    const filteredRecipes = recipes.filter(r => {
      if (!userId) return r.visible;
      return r.visible || r.authorId === userId || !!r.permissions.find(p => p.userId === userId);
    });

    return await Promise.all(filteredRecipes.map(async (v) => {
      const permissions = await Promise.all(v.permissions.map(async (p) => {
        const user = await this.databaseService.user.findUnique({ where: { id: p.userId } });
        return new PermissionDto(user.username, p.permission);
      }));

      const comments = await Promise.all(v.comments.map(async (c) => {
        const user = await this.databaseService.user.findUnique({ where: { id: c.userId } });
        return new CommentDto(user.username, c.comment);
      }));

      const rating = v.recipeRating.length === 0 ? 3 : v.recipeRating.reduce((acc, cur) => acc + cur.rating, 0) / v.recipeRating.length;

      return new CreateRecipeDto(
        v.id,
        v.name,
        v.description,
        v.directions,
        v.imagePath,
        v.ingredients.map(i => new IngredientDto(i.id, i.name, i.amount)),
        v.visible,
        rating,
        v.recipeRating.length,
        permissions,
        comments
      );
    }));
  }

  async search(name: string, userId?: string) {
    const allRecipes = await this.findAll(userId);
    return allRecipes.sort((firstRec, secRec) => this.match(firstRec, name) - this.match(secRec, name));
  }

  private match(recipe: CreateRecipeDto, name: string): number {
    const nameWords = name.toLowerCase().split(' ');
    let score = recipe.rating ?? 0;

    nameWords.forEach(word => {
      if (recipe.name.toLowerCase().includes(word)) {
        score += 10;
        console.log(score, word);
      }
      if (recipe.description.toLowerCase().includes(word)) {
        score += 5;
        console.log(score, word);
      }
    });

    console.log(score, name, recipe);
    return score;
  }

  async addComment(comment: string, recipe: CreateRecipeDto, userId: string) {
    const recipeId = (await this.databaseService.recipe.findFirst({ where: { name: recipe.name, description: recipe.description, directions: recipe.directions } })).id;
    const commentObj = { userId: userId, recipeId: recipeId, comment: comment };
    console.log(commentObj);
    const createdComment = await this.databaseService.comments.create({ data: commentObj });
    return createdComment;
  }

  async addRating(rating: string, recipe: CreateRecipeDto, userId: string) {
    if (+rating > 5 || +rating < 0)
        throw new ForbiddenException("rating isn't valid");
    const recipeId = (await this.databaseService.recipe.findFirst({ where: { name: recipe.name, description: recipe.description, directions: recipe.directions } })).id;
    await this.databaseService.rating.deleteMany({ where: { userId: userId, recipeId: recipeId } });
    const ratingObj = { userId: userId, recipeId: recipeId, rating: +rating };
    const createdRating = await this.databaseService.rating.create({ data: ratingObj });
    return createdRating;
  }
}