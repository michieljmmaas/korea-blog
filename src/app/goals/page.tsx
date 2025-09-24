import { GoalService } from "@/lib/goalService";
import { GoalItem } from "../_components/goals/goal-item";

export default async function Goal() {
    const goals = await GoalService.getAllGoals();


    return <div>
        {goals.map((goal) => (
            <GoalItem key={goal.text} goal={goal} />
        ))}
    </div>
}