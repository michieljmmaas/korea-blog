import { FoodService } from "@/lib/foodService";
import { FoodClientWrapper } from "../_components/food/food-client-wrapper";

export default async function Food() {
    const foods = await FoodService.getAllFoods();
    return <FoodClientWrapper foods={foods} />;
}