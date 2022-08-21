import styled from "@emotion/styled"
import { KeyboardTab } from "@mui/icons-material"
import {
  FormControl,
  ListItemIcon,
  MenuItem,
  Select,
  Slider,
} from "@mui/material"
import { useStarknetCall } from "@starknet-react/core"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { NoteEvent } from "../../../common/track"
import { addNoteToSelection } from "../../actions/selection"
import { createNote2 } from "../../actions/track"
import { useCounterContract } from "../../hooks/useCounterContract"
import { useStores } from "../../hooks/useStores"
import { DrawerOptions } from "../../stores/SharknetStore"
import { NumberPicker } from "../Toolbar/QuantizeSelector/NumberPicker"
import { ToolbarButton } from "../Toolbar/ToolbarButton"

const AddTrackListIcon = styled(ListItemIcon)`
  min-width: auto;
  margin-right: 0.6em;
`

const List = styled.div`
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.dividerColor};
  min-width: 14rem;
  padding: 10px;
`

const AutoScrollIcon = styled(KeyboardTab)`
  height: 2rem;
  font-size: 1.3rem;
`
const contractOptions = [
  { name: "Shearing", value: "Shearing" },
  { name: "Counterpoint", value: "Counterpoint" },
  { name: "Maj7", value: "Maj7" },
  { name: "Maj6", value: "Maj6" },
]
const keyNOptions = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]
const keyCOptions = [
  "Major",
  "Minor",
  "Dorian",
  "Lydian",
  "Mixolydian",
  "Aeloian",
  "Phyrigian",
]
const HARMONY_MAX_VALUE = 5
const HARMONY_MIN_VALUE = 0
const INVERSION_MAX_VALUE = 5
const INVERSION_MIN_VALUE = 0

export const SharknetDrawer: FC = observer(() => {
  const { sharknet, selectedNotes } = useStores()
  const drawerOptions = sharknet?.drawerOptions || {}
  const rootStore = useStores()
  const [callArgs, setCallArgs] = useState<number[][]>([[]])

  const { contract: counter } = useCounterContract()
  const { data } = useStarknetCall({
    contract: counter,
    method: "get_notes_of_key6",
    args: callArgs,
    options: { watch: true },
  })

  const onChangeForm = (key: string, value: string | number) => {
    sharknet.drawerOptions = {
      ...sharknet.drawerOptions,
      [key]: value,
    }
  }

  const serializeNotes = (notes: NoteEvent[]) => {
    const nums: number[] = []
    notes.map((note) => {
      nums.push(note.duration)
      nums.push(note.noteNumber)
      nums.push(note.tick)
      nums.push(note.velocity)
    })
    return nums
  }

  const serializeDrawerOptions = (drawerOptions: DrawerOptions) => {
    const nums: number[] = []
    // TOOD need a way to serialize these strings
    nums.push(
      contractOptions.findIndex(
        (contract) => contract.value === drawerOptions.contract
      )
    )
    nums.push(keyNOptions.findIndex((opt) => opt === drawerOptions.keyN || ""))
    nums.push(keyCOptions.findIndex((opt) => opt === drawerOptions.keyC || ""))
    nums.push(drawerOptions.harmonies)
    nums.push(drawerOptions.inversion)
    nums.push(drawerOptions.spread)
    return nums
  }
  const onCompute = () => {
    console.log("handle compute", sharknet?.drawerOptions)
    console.log("Selectednotes", selectedNotes.selectedNotes)

    const serializedNoted = serializeNotes(selectedNotes.selectedNotes)
    const serializedDrawerOptions = serializeDrawerOptions(
      sharknet.drawerOptions
    )
    // setCallArgs([serializedNoted, serializedDrawerOptions])
    const mergedParams = serializedNoted.concat(serializedDrawerOptions)
    const withLength = [[mergedParams.length].concat(mergedParams)]
    setCallArgs(withLength)

    if (data) {
      //console.log(console.log(data[0].map((bn: any) => bn.toString())))
      console.log("data")
      console.log(data.length)
      console.log(data[0])
      console.log(data[0].length)

      for (let i = 0; i < data[0].length; i = i + 4) {
        rootStore.song.selectedTrack?.addEvent<NoteEvent>({
          type: "channel",
          subtype: "note",
          duration: data[0][i],
          tick: data[0][i + 2],
          velocity: data[0][i + 3],
          noteNumber: data[0][i + 1],
        })

        const note = createNote2(rootStore)(
          data[0][i + 2],
          data[0][i + 1],
          data[0][i + 3],
          data[0][i]
        )
        if (note === undefined) {
          return
        }
        console.log(note.id)
        addNoteToSelection(rootStore)(note.id)
      }
    }

    //console.log(withLength)
  }

  return (
    <List>
      <div>
        <FormControl fullWidth>
          <Select
            value={drawerOptions.contract}
            size="small"
            onChange={(ev) => onChangeForm("contract", ev.target.value)}
            defaultValue="Shearing"
          >
            {contractOptions.map((contractOption, index) => (
              <MenuItem key={index} value={contractOption.value}>
                {contractOption.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
          <label style={{ marginRight: 10 }}>{localized("key", "Key")}</label>
          <FormControl sx={{ flex: 1 }}>
            <Select
              value={drawerOptions.keyN}
              onChange={(ev) => onChangeForm("keyN", ev.target.value)}
              size="small"
              defaultValue="C"
            >
              {keyNOptions.map((opt, index) => (
                <MenuItem key={index} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <Select
              value={drawerOptions.keyC}
              onChange={(ev) => onChangeForm("keyC", ev.target.value)}
              size="small"
              defaultValue="Major"
            >
              {keyCOptions.map((opt, index) => (
                <MenuItem key={index} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
          <label style={{ marginRight: 10 }}>
            {localized("harmonies", "Harmonies")}
          </label>
          <NumberPicker
            value={drawerOptions.harmonies}
            prevValue={() =>
              drawerOptions.harmonies > HARMONY_MIN_VALUE
                ? drawerOptions.harmonies - 1
                : HARMONY_MIN_VALUE
            }
            nextValue={() =>
              drawerOptions.harmonies < HARMONY_MAX_VALUE
                ? drawerOptions.harmonies + 1
                : HARMONY_MAX_VALUE
            }
            onChange={(value) => onChangeForm("harmonies", value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
          <label style={{ marginRight: 20 }}>
            {localized("inversion", "Inversion")}
          </label>
          <NumberPicker
            value={drawerOptions.inversion}
            prevValue={() =>
              drawerOptions.inversion > INVERSION_MIN_VALUE
                ? drawerOptions.inversion - 1
                : INVERSION_MIN_VALUE
            }
            nextValue={() =>
              drawerOptions.inversion < INVERSION_MAX_VALUE
                ? drawerOptions.inversion + 1
                : INVERSION_MAX_VALUE
            }
            onChange={(value) => onChangeForm("inversion", value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
          <label style={{ marginRight: 10 }}>
            {localized("spread", "Spread")}
          </label>
          <Slider
            size="small"
            value={drawerOptions.spread}
            defaultValue={0}
            aria-label="Small"
            valueLabelDisplay="auto"
            onChange={(ev, newNumber) =>
              onChangeForm("spread", newNumber as number)
            }
          />
        </div>

        <div
          style={{ marginTop: 20, display: "flex", justifyContent: "center" }}
        >
          <ToolbarButton onClick={onCompute} selected={true}>
            <AutoScrollIcon />
          </ToolbarButton>
        </div>
      </div>
    </List>
  )
})
