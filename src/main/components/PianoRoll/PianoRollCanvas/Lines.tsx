import { useTheme } from "@emotion/react"
import Color from "color"
import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { Layout } from "../../../Constants"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { HorizontalGrid } from "./HorizontalGrid"

export const Lines: VFC<{ zIndex: number }> = observer(({ zIndex }) => {
  const theme = useTheme()
  const rootStore = useStores()
  const {
    pianoRollStore: { scrollTop, canvasWidth, canvasHeight, scaleY },
  } = rootStore

  return (
    <HorizontalGrid
      rect={{
        x: 0,
        y: scrollTop,
        width: canvasWidth,
        height: canvasHeight,
      }}
      color={colorToVec4(Color(theme.dividerColor).alpha(0.2))}
      highlightedColor={colorToVec4(Color(theme.dividerColor).alpha(0.5))}
      blackLaneColor={colorToVec4(Color(theme.pianoBlackKeyLaneColor))}
      height={scaleY * Layout.keyHeight}
      zIndex={zIndex}
    />
  )
})
