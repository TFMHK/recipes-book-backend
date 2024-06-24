export class IngredientDto{
    id:string;
    name:string;
    amount:number;

    constructor(id: string,name: string, amount: number){
        this.id = id;
        this.name = name;
        this.amount = amount;
    }
}