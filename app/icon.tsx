import { ImageResponse } from 'next/og'

export const size = { width: 48, height: 48 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1d4ed8',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        {/* EDT lettering */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0px',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '22px',
              fontWeight: 900,
              fontFamily: 'sans-serif',
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            EDT
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
