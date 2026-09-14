export default function TutorialCard({ tutorial, example }) {
  if (!tutorial) return null;

  return (
    <div className="tutorial-card">
      <p className="tutorial-card__label">📘 Quick Lesson</p>
      <p className="tutorial-card__text">{tutorial}</p>
      {example && (
        <pre className="tutorial-card__example">
          <code>{example}</code>
        </pre>
      )}
    </div>
  );
}
