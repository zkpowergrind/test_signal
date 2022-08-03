import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import Color from "color"
import { clamp } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useRef } from "react"
import {
  containsPoint,
  IPoint,
  pointAdd,
  pointSub,
} from "../../../common/geometry"
import {
  arrangeEndSelection,
  arrangeMoveSelection,
  arrangeResizeSelection,
  arrangeStartSelection,
  selectTrack,
} from "../../actions"
import { Layout, WHEEL_SCROLL_RATE } from "../../Constants"
import { getClientPos } from "../../helpers/mouseEvent"
import { observeDrag } from "../../helpers/observeDrag"
import { isTouchPadEvent } from "../../helpers/touchpad"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import {
  HorizontalScaleScrollBar,
  VerticalScaleScrollBar,
} from "../inputs/ScaleScrollBar"
import { BAR_WIDTH } from "../inputs/ScrollBar"
import CanvasPianoRuler from "../PianoRoll/CanvasPianoRuler"
import { ArrangeContextMenu } from "./ArrangeContextMenu"
import { ArrangeTrackContextMenu } from "./ArrangeTrackContextMenu"
import { ArrangeViewCanvas } from "./ArrangeViewCanvas/ArrangeViewCanvas"

const Wrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  position: relative;
  background: ${({ theme }) => theme.backgroundColor};
  overflow: hidden;
`

const LeftTopSpace = styled.div`
  z-index: 999;
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
  background: ${({ theme }) => theme.backgroundColor};
`

const LeftBottomSpace = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: ${({ theme }) => theme.backgroundColor};
`

const TrackHeader = styled.div<{ isSelected: boolean }>`
  width: 8rem;
  padding: 0 0.5rem;
  box-sizing: border-box;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.secondaryBackgroundColor : theme.backgroundColor};
`

const HeaderList = styled.div`
  position: relative;
  border-right: 1px solid ${({ theme }) => theme.dividerColor};
`

type DragHandler = (
  e: MouseEvent,
  mouseMove: (handler: (e: MouseEvent, delta: IPoint) => void) => void,
  mouseUp: (handler: (e: MouseEvent) => void) => void
) => void

export const ArrangeView: FC = observer(() => {
  const rootStore = useStores()

  const tracks = rootStore.song.tracks

  const { arrangeViewStore: s } = rootStore

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const {
    selection,
    selectionRect,
    trackHeight,
    contentWidth,
    transform,
    trackTransform,
    scrollLeft,
    scrollTop,
    scrollBy,
    selectedTrackId,
  } = rootStore.arrangeViewStore

  const setScrollLeft = useCallback(
    (v: number) => rootStore.arrangeViewStore.setScrollLeftInPixels(v),
    []
  )
  const setScrollTop = useCallback(
    (v: number) => rootStore.arrangeViewStore.setScrollTop(v),
    []
  )

  const containerWidth = size.width
  const contentHeight = trackHeight * tracks.length

  const theme = useTheme()

  useEffect(() => {
    rootStore.arrangeViewStore.canvasWidth = size.width
  }, [size.width])

  useEffect(() => {
    rootStore.arrangeViewStore.canvasHeight = size.height
  }, [size.height])

  const onClickScaleUpHorizontal = useCallback(
    () => s.scaleAroundPointX(0.2, 0),
    [s]
  )
  const onClickScaleDownHorizontal = useCallback(
    () => s.scaleAroundPointX(-0.2, 0),
    [s]
  )
  const onClickScaleResetHorizontal = useCallback(() => (s.scaleX = 1), [s])

  const onClickScaleUpVertical = useCallback(
    () => s.setScaleY(s.scaleY * (1 + 0.2)),
    [s]
  )
  const onClickScaleDownVertical = useCallback(
    () => s.setScaleY(s.scaleY * (1 - 0.2)),
    [s]
  )
  const onClickScaleResetVertical = useCallback(() => s.setScaleY(1), [s])

  const handleLeftClick = useCallback(
    (e: React.MouseEvent) => {
      const startPosPx: IPoint = {
        x: e.nativeEvent.offsetX + scrollLeft,
        y: e.nativeEvent.offsetY - Layout.rulerHeight + scrollTop,
      }

      const isSelectionSelected =
        selectionRect != null && containsPoint(selectionRect, startPosPx)

      const createSelectionHandler: DragHandler = (e, mouseMove, mouseUp) => {
        const startPos = trackTransform.getArrangePoint(startPosPx)
        arrangeStartSelection(rootStore)(startPos)

        if (!rootStore.player.isPlaying) {
          rootStore.player.position =
            rootStore.arrangeViewStore.quantizer.round(startPos.tick)
        }

        rootStore.arrangeViewStore.selectedTrackId = Math.floor(
          startPos.trackIndex
        )

        mouseMove((e, deltaPx) => {
          const selectionToPx = pointAdd(startPosPx, deltaPx)
          arrangeResizeSelection(rootStore)(
            startPos,
            trackTransform.getArrangePoint(selectionToPx)
          )
        })
        mouseUp((e) => {
          arrangeEndSelection(rootStore)()
        })
      }

      const dragSelectionHandler: DragHandler = (e, mouseMove, mouseUp) => {
        if (selectionRect == null) {
          return
        }

        mouseMove((e, deltaPx) => {
          const selectionFromPx = pointAdd(deltaPx, selectionRect)
          arrangeMoveSelection(rootStore)(
            trackTransform.getArrangePoint(selectionFromPx)
          )
        })
        mouseUp((e) => {})
      }

      let handler

      if (isSelectionSelected) {
        handler = dragSelectionHandler
      } else {
        handler = createSelectionHandler
      }

      let mouseMove: (e: MouseEvent, delta: IPoint) => void
      let mouseUp: (e: MouseEvent) => void
      handler(
        e.nativeEvent,
        (fn) => (mouseMove = fn),
        (fn) => (mouseUp = fn)
      )

      const startClientPos = getClientPos(e.nativeEvent)

      observeDrag({
        onMouseMove: (e) =>
          mouseMove(e, pointSub(getClientPos(e), startClientPos)),
        onMouseUp: (e) => mouseUp(e),
      })
    },
    [selection, trackTransform, rootStore, scrollLeft, scrollTop]
  )

  const handleMiddleClick = useCallback(
    (e: React.MouseEvent) => {
      function createPoint(e: MouseEvent) {
        return { x: e.clientX, y: e.clientY }
      }
      const startPos = createPoint(e.nativeEvent)

      observeDrag({
        onMouseMove(e) {
          const pos = createPoint(e)
          const delta = pointSub(pos, startPos)
          setScrollLeft(Math.max(0, scrollLeft - delta.x))
          setScrollTop(Math.max(0, scrollTop - delta.y))
        },
      })
    },
    [scrollLeft, scrollTop]
  )

  const { onContextMenu, menuProps } = useContextMenu()
  const { onContextMenu: onTrackContextMenu, menuProps: trackMenuProps } =
    useContextMenu()

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      switch (e.button) {
        case 0:
          handleLeftClick(e)
          break
        case 1:
          handleMiddleClick(e)
          break
        case 2:
          onContextMenu(e)
          break
        default:
          break
      }
    },
    [handleLeftClick, handleMiddleClick, onContextMenu]
  )

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.shiftKey && (e.altKey || e.ctrlKey)) {
        // vertical zoom
        let scaleYDelta = isTouchPadEvent(e.nativeEvent)
          ? 0.02 * e.deltaY
          : 0.01 * e.deltaX
        scaleYDelta = clamp(scaleYDelta, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.setScaleY(s.scaleY * (1 + scaleYDelta))
      } else if (e.altKey || e.ctrlKey) {
        // horizontal zoom
        const scaleFactor = isTouchPadEvent(e.nativeEvent) ? 0.01 : -0.01
        const scaleXDelta = clamp(e.deltaY * scaleFactor, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.scaleAroundPointX(scaleXDelta, e.nativeEvent.offsetX)
      } else {
        const scaleFactor = isTouchPadEvent(e.nativeEvent)
          ? 1
          : 20 * transform.pixelsPerKey * WHEEL_SCROLL_RATE
        const deltaY = e.deltaY * scaleFactor
        s.scrollBy(-e.deltaX, -deltaY)
      }
    },
    [s, scrollBy]
  )

  const openTrack = (trackId: number) => {
    rootStore.router.pushTrack()
    selectTrack(rootStore)(trackId)
  }

  return (
    <Wrapper>
      <HeaderList>
        <LeftTopSpace style={{ height: Layout.rulerHeight }} />
        <div
          style={{
            marginTop: Layout.rulerHeight,
            transform: `translateY(${-scrollTop}px)`,
          }}
        >
          {tracks.map((t, i) => (
            <TrackHeader
              style={{ height: trackHeight }}
              key={i}
              isSelected={i === selectedTrackId}
              onClick={() => (rootStore.arrangeViewStore.selectedTrackId = i)}
              onDoubleClick={() => openTrack(i)}
              onContextMenu={(e) => {
                rootStore.arrangeViewStore.selectedTrackId = i
                onTrackContextMenu(e)
              }}
            >
              {t.displayName}
            </TrackHeader>
          ))}
        </div>
        <LeftBottomSpace style={{ height: BAR_WIDTH }} />
      </HeaderList>
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          ref={ref}
          onMouseDown={onMouseDown}
          onContextMenu={useCallback((e: any) => e.preventDefault(), [])}
          onWheel={onWheel}
          style={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            background: Color(theme.backgroundColor).darken(0.1).hex(),
          }}
        >
          <CanvasPianoRuler
            rulerStore={rootStore.arrangeViewStore.rulerStore}
            style={{
              background: theme.backgroundColor,
              borderBottom: `1px solid ${theme.dividerColor}`,
              boxSizing: "border-box",
            }}
          />
          <ArrangeViewCanvas width={containerWidth} />
        </div>
        <div
          style={{
            width: `calc(100% - ${BAR_WIDTH}px)`,
            position: "absolute",
            bottom: 0,
          }}
        >
          <HorizontalScaleScrollBar
            scrollOffset={scrollLeft}
            contentLength={contentWidth}
            onScroll={setScrollLeft}
            onClickScaleUp={onClickScaleUpHorizontal}
            onClickScaleDown={onClickScaleDownHorizontal}
            onClickScaleReset={onClickScaleResetHorizontal}
          />
        </div>
      </div>
      <div
        style={{
          height: `calc(100% - ${BAR_WIDTH}px)`,
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <VerticalScaleScrollBar
          scrollOffset={scrollTop}
          contentLength={contentHeight + Layout.rulerHeight}
          onScroll={setScrollTop}
          onClickScaleUp={onClickScaleUpVertical}
          onClickScaleDown={onClickScaleDownVertical}
          onClickScaleReset={onClickScaleResetVertical}
        />
      </div>
      <div
        style={{
          width: BAR_WIDTH,
          height: BAR_WIDTH,
          position: "absolute",
          bottom: 0,
          right: 0,
          background: theme.backgroundColor,
        }}
      />
      <ArrangeContextMenu {...menuProps} />
      <ArrangeTrackContextMenu {...trackMenuProps} />
    </Wrapper>
  )
})
