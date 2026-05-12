interface Props {
  value: number
  onChange?: (n: number) => void
  size?: number
}

export function StarRating({ value, onChange, size = 24 }: Props) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          style={{ fontSize: size }}
          className={n <= value ? 'text-amber-500' : 'text-neutral-300'}
        >
          ★
        </button>
      ))}
    </div>
  )
}
