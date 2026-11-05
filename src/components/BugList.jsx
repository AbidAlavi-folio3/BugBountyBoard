import BugCard from "./BugCard";

export default function BugList({ bugs }) {
    return (
        <div>
            {bugs.map((bug)=> (
                <BugCard key={bug.id} bug={bug}/>
            ))}
        </div>
    )
}