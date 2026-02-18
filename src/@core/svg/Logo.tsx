// React Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='1.2em' height='1em' viewBox='0 0 100 80' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      {/* Dove / Wave part */}
      <path
        d='M40 30C55 10 85 20 95 45C80 40 65 45 55 60C50 45 35 40 20 45C30 35 35 35 40 30Z'
        fill='currentColor'
        fillOpacity='0.8'
      />
      {/* Ark Base */}
      <path d='M10 50L20 70H80L90 50C70 55 30 55 10 50Z' fill='currentColor' />
      {/* Detail on the boat */}
      <path d='M25 60H75' stroke='white' strokeWidth='2' strokeLinecap='round' opacity='0.3' />
    </svg>
  )
}

export default Logo
