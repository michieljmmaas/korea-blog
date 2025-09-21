import { FoodService } from "@/lib/foodService";
import { FoodItem } from "../_components/food/food-item";

export default async function Food() {
    const foods = await FoodService.getAllFoods();


    return <div>
        {foods.map((food) => (
            <FoodItem key={food.name} food={food} />
        ))}
    </div>
}