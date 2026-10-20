/** Renders a molecular formula like C187H291N45O59 with subscripted counts, in the text face. */
export function Formula({ value }: { value: string }) {
  const parts = value.match(/[A-Z][a-z]?|\d+/g) ?? [value];
  return (
    <span className="tabular" translate="no">
      {parts.map((part, i) => (/^\d+$/.test(part) ? <sub key={i}>{part}</sub> : <span key={i}>{part}</span>))}
    </span>
  );
}
