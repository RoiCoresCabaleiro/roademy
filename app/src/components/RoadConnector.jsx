export default function RoadConnector({
  startSide = "center", // "left", "center", "right"
  endSide = "center", // "left", "center", "right"
}) {
  const positions = {
    mobile: {
      left: 80,
      center: 160,
      right: 240,
    },
    desktop: {
      left: 50,
      center: 200,
      right: 350,
    },
  }

  const createPath = (config) => {
    const startX = config[startSide]
    const endX = config[endSide]
    const height = 80

    if (startSide === endSide) {
      return `M ${startX},0 L ${endX},${height}`
    }

    const midY = height / 2
    const quarterY = height / 4
    const threeQuarterY = (3 * height) / 4

    return `M ${startX},0 
            L ${startX},${quarterY} 
            Q ${startX},${midY} ${(startX + endX) / 2},${midY}
            Q ${endX},${midY} ${endX},${threeQuarterY}
            L ${endX},${height}`
  }

  return (
    <>
      {/* Versión móvil */}
      <div className="flex justify-center my-4 md:hidden">
        <svg width="320" height="80" viewBox="0 0 320 80" className="road-connector">
          <path
            d={createPath(positions.mobile)}
            stroke="#000000"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={createPath(positions.mobile)}
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="8,6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Versión desktop */}
      <div className="hidden md:flex justify-center my-6">
        <svg width="400" height="80" viewBox="0 0 400 80" className="road-connector">
          <path
            d={createPath(positions.desktop)}
            stroke="#000000"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={createPath(positions.desktop)}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="12,8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  )
}
