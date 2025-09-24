import { FoodService } from "@/lib/foodService";
import { FoodLocation } from "../_components/food/food-location";

export default async function Food() {
    const foods = await FoodService.getAllFoodsGrouped();


    return <div>
        {foods.map((locationGroupedFoods) => (
            <FoodLocation key={locationGroupedFoods.location} locationData={locationGroupedFoods} />
        ))}
    </div>
}