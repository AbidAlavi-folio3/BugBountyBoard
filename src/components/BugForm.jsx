import { useState } from "react";

function BugForm({onAddBug}) {
    const [title, setTitle] = useState("");
    const [severity, setSeverity] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        if(!title.trim()) {
            return;
        }

        if(!severity.trim()) {
            return;
        }

        onAddBug(title.trim(), severity.trim());
        setTitle("");
        setSeverity("");

    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Report a bug</h2>

            <input
                type="text"
                placeholder="Enter bug title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <input
                type="text"
                placeholder="Enter bug Severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
            />

            <button type="submit" >Submit</button>
        </form>
    );
}


export default BugForm;