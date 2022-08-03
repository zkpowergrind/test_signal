import { Rectangles } from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { VFC } from "react"

export const Cursor: VFC<{ x: number; height: number; zIndex: number }> = ({
  x,
  height,
  zIndex,
}) => {
  const color = vec4.fromValues(1, 0, 0, 1)

  return (
    <Rectangles
      rects={[
        {
          x,
          y: 0,
          width: 1,
          height,
        },
      ]}
      color={color}
      zIndex={zIndex}
    />
  )
}
