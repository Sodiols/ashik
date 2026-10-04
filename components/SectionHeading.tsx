type SectionHeadingProps = { id: string; first: string; second: string };

export function SectionHeading({ id, first, second }: SectionHeadingProps) {
  return (
    <h2 id={id} aria-label={`${first} ${second}`}>
      <span className="title-line" aria-hidden="true">
        <span className="title-word">
          {Array.from(first).map((letter, index) => (
            <span className={letter === " " ? "title-character title-space" : "title-character"} key={index}>
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </span>
      </span>
      <span className="title-line title-line-serif" aria-hidden="true">
        <em className="title-word">{second}</em>
      </span>
    </h2>
  );
}
