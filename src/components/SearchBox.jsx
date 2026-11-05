function SearchBox({ search, setSearch }) {
    return (
        <input
            type="text"
            placeholder="Search bugs.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
    )
}

export default SearchBox;