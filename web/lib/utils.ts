export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function formatStorage(usedGB: number, totalGB: number): string {
  const format = (value: number) =>
    Number.isInteger(value) ? `${value} GB` : `${value.toFixed(1)} GB`;
  return `${format(usedGB)} / ${format(totalGB)}`;
}
