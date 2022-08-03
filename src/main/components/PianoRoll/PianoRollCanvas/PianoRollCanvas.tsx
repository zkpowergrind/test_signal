import { GLCanvas, Transform } from "@ryohey/webgl-react"
import { observer } from "mobx-react-lite"
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useContextMenu } from "../../../hooks/useContextMenu"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLNodes/Beats"
import { Cursor } from "../../GLNodes/Cursor"
import { Selection } from "../../GLNodes/Selection"
import NoteMouseHandler from "../MouseHandler/NoteMouseHandler"
import { PianoRollStageProps } from "../PianoRollStage"
import { PianoSelectionContextMenu } from "../PianoSelectionContextMenu"
import { GhostNotes } from "./GhostNotes"
import { Lines } from "./Lines"
import { Notes } from "./Notes"

export const PianoRollCanvas: FC<PianoRollStageProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores()
    const {
      notesCursor,
      scrollLeft,
      scrollTop,
      rulerStore: { beats },
      cursorX,
      selectionBounds,
    } = rootStore.pianoRollStore

    const [mouseHandler] = useState(new NoteMouseHandler(rootStore))

    const { onContextMenu, menuProps } = useContextMenu()

    const handleContextMenu: MouseEventHandler = useCallback((e) => {
      if (rootStore.pianoRollStore.mouseMode === "selection") {
        e.stopPropagation()
        onContextMenu(e)
        return
      }
    }, [])

    useEffect(() => {
      rootStore.pianoRollStore.canvasWidth = width
    }, [width])

    useEffect(() => {
      rootStore.pianoRollStore.canvasHeight = height
    }, [height])

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft]
    )

    const scrollYMatrix = useMemo(
      () => matrixFromTranslation(0, -scrollTop),
      [scrollLeft, scrollTop]
    )

    const scrollXYMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, -scrollTop),
      [scrollLeft, scrollTop]
    )

    return (
      <>
        <GLCanvas
          width={width}
          height={height}
          style={{ cursor: notesCursor }}
          onContextMenu={handleContextMenu}
          onMouseDown={mouseHandler.onMouseDown}
          onMouseMove={mouseHandler.onMouseMove}
          onMouseUp={mouseHandler.onMouseUp}
        >
          <Transform matrix={scrollYMatrix}>
            <Lines zIndex={0} />
          </Transform>
          <Transform matrix={scrollXMatrix}>
            <Beats height={height} beats={beats} zIndex={1} />
            <Cursor x={cursorX} height={height} zIndex={5} />
          </Transform>
          <Transform matrix={scrollXYMatrix}>
            <GhostNotes zIndex={2} />
            <Notes zIndex={3} />
            <Selection rect={selectionBounds} zIndex={4} />
          </Transform>
        </GLCanvas>
        <PianoSelectionContextMenu {...menuProps} />
      </>
    )
  }
)
