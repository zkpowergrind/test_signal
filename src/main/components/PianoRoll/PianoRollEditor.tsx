import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { PianoRollKeyboardShortcut } from "../KeyboardShortcut/PianoRollKeyboardShortcut"
import { PianoRollToolbar } from "../PianoRollToolbar/PianoRollToolbar"
import { StarknetDrawer } from "../Starknet/StarknetDrawer"
import { TrackList } from "../TrackList/TrackList"
import PianoRoll from "./PianoRoll"

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  overflow: hidden;
  flex-basis: 0;
`

export const PianoRollEditor: FC = observer(() => {
  const { rootViewStore } = useStores()
  const openTrackList = rootViewStore.openTrackListDrawer
  const openStarknetDrawer = rootViewStore.openStarknetDrawer

  return (
    <ColumnContainer>
      <PianoRollKeyboardShortcut />
      <PianoRollToolbar />
      <RowContainer>
        {openTrackList && <TrackList />}
        {openStarknetDrawer && <StarknetDrawer />}
        <PianoRoll />
      </RowContainer>
    </ColumnContainer>
  )
})
