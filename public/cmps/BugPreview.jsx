export function BugPreview({ bug }) {
  return (
    <article className="bug-preview">
      <p className="title">{bug.title}</p>
      <p>
        Severity: <span>{bug.severity}</span>
      </p>
      <p>
        Owner: <span>{bug.owner.fullname}</span>
      </p>
    </article>
  )
}
