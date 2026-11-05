import { Link } from "react-router-dom";

function BugCard({ bug }) {
    return (
        <div>
            <h3>{bug.title}</h3>
            <p>Severity: {bug.severity}</p>
            <Link to={`/bugs/${bug.id}`}>
                View Details
            </Link>
        </div>
    )
}

export default BugCard;