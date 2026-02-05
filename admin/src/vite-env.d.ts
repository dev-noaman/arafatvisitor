/// <reference types="vite/client" />

// SVG imports via vite-plugin-svgr
declare module '*.svg?react' {
  import * as React from 'react'
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}

// CSS imports
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}
