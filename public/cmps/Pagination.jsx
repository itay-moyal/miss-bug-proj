const { useState } = React
const PAGE_SIZE = 3

export function Pagination({ pageCount, filterBy, setFilterBy }) {
  const [paginationOn, setPaginationOn] = useState(false)
  function onTogglePagination(ev) {
    if (paginationOn) {
      setPaginationOn(false)
      setFilterBy({ pageIdx: undefined })
    } else {
      setPaginationOn(true)
      setFilterBy({ pageIdx: 0, pageSize: PAGE_SIZE })
    }
  }

  function onPage(diff) {
    const pageIdx = filterBy.pageIdx + diff
    setFilterBy({ pageIdx })
  }
  return (
    <div className="pagination">
      <label className="tag">
        Pagination
        <input
          type="checkbox"
          onChange={onTogglePagination}
          checked={paginationOn}
        />
      </label>
      {paginationOn && (
        <button disabled={filterBy.pageIdx === 0} onClick={() => onPage(-1)}>
          Prev
        </button>
      )}

      {paginationOn && (
        <button
          disabled={filterBy.pageIdx === pageCount - 1}
          onClick={() => onPage(1)}
        >
          Next
        </button>
      )}
    </div>
  )
}
