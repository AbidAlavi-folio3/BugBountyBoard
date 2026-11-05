import { Link, useParams } from "react-router-dom";

function BugDetails({ bugs }) {
  const { id } = useParams();

  const bug = bugs.find(
    (item) => String(item.id) === id
  );

  if (!bug) {
    return (
      <div>
        <h2>Bug not found</h2>
        <Link to="/">Back to Bugs</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/">Back to Bugs</Link>

      <h1>{bug.title}</h1>
      <p>Bug ID: {bug.id}</p>
      <p>Severity: {bug.severity}</p>
    </div>
  );
}

export default BugDetails;