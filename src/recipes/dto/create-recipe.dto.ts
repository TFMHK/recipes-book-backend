import { CommentDto } from "./comment.dto";
import { IngredientDto } from "./ingredient.dto";
import { PermissionDto } from "./permission.dto";

export class CreateRecipeDto {
    id: string;
    name: string;
    description: string;
    directions: string;
    imagePath: string;
    ingredients: IngredientDto[];
    visible: boolean;
    rating: number;
    ratingAmount: number;
    permissions: PermissionDto[];
    comments: CommentDto[];
    isSaved: boolean;

    constructor(id:string, name: string, description: string, directions: string, imagePath: string, ingredients: IngredientDto[], visible?: boolean, rating?: number, ratingAmount?: number, permissions?:PermissionDto[], comments?:CommentDto[]){
        this.id = id;
        this.name = name;
        this.description = description;
        this.directions = directions;
        this.imagePath = imagePath;
        this.ingredients = ingredients;
        this.visible = visible ?? true;
        this.rating = rating ?? 3;
        this.ratingAmount = ratingAmount??0;
        this.permissions = permissions??[];
        this.comments = comments??[];
        this.isSaved = true;
    }
}