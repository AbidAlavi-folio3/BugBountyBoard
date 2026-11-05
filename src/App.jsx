import { useState, useEffect } from 'react';
import { fetchBugs } from "./mockApi";
import BugList from './components/BugList';
import SearchBox from './components/SearchBox';
import BugForm from './components/BugForm';
import { Routes, Route } from 'react-router-dom';
import BugDetails from "./pages/BugDetails";
import NotFound from "./pages/NotFound";

export default function App() {

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadBugs() {
      try {
        const data = await fetchBugs();
        setBugs(data);
      } catch(error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadBugs();
  }, []);


  const filteredBugs = bugs.filter((bug) => {
    return bug.title.toLowerCase().includes(search.toLowerCase());
  });

  function handleAddBug(title , severity) {
    const newBug = {
      id: bugs.length + 1,
      title: title,
      severity: severity
    }

    setBugs((prevBugs) => [...prevBugs, newBug]);
  }

  if (loading) {
    return <p>Loading bugs...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // console.log("Original Bugs:", bugs);
  // console.log("Search Value:", search);
  // console.log("Filtered Bugs:", filteredBugs);

  return (
  <Routes>
    <Route
      path="/"
      element={
        <div>
          <h1>Bug Bounty Board</h1>

          <BugForm onAddBug={handleAddBug} />

          <SearchBox search={search} setSearch={setSearch} />

          <BugList bugs={filteredBugs} />
        </div>
      }
    />

    <Route
      path="/bugs/:id"
      element={<BugDetails bugs={bugs} />}
    />

    <Route path="*" element={<NotFound />} />
  </Routes>
);
}
