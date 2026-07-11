export default function RadarChart({ values, size = 220 }) {
  const center = size / 2
  const maxR = size / 2 - 34
  const n = values.length
  const angleFor = i => (Math.PI * 2 * i) / n - Math.PI / 2

  function pointAt(i, fraction) {
    const angle = angleFor(i)
    const r = maxR * fraction
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const rings = [0.25, 0.5, 0.75, 1]
  const dataPoints = values.map((v, i) => pointAt(i, Math.max(0, Math.min(1, v.value / 100))))
  const dataPath = dataPoints.map(p => p.join(',')).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map(r => {
        const pts = values.map((_, i) => pointAt(i, r).join(',')).join(' ')
        return <polygon key={r} points={pts} fill="none" stroke="var(--border)" strokeWidth="1" />
      })}
      {values.map((_, i) => {
        const [x, y] = pointAt(i, 1)
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
      })}
      <polygon points={dataPath} fill="var(--blue-acc)" fillOpacity="0.35" stroke="var(--blue-acc)" strokeWidth="2" />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="var(--blue-acc)" />
      ))}
      {values.map((v, i) => {
        const [lx, ly] = pointAt(i, 1.26)
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="var(--text)">
            {v.label}
          </text>
        )
      })}
    </svg>
  )
}
