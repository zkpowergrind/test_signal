import styled from "@emotion/styled"
import { KeyboardTab } from "@mui/icons-material"
import {
  FormControl,
  ListItemIcon,
  MenuItem,
  Select,
  Slider,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
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
const keyNOptions = ["C", "D"]
const keyCOptions = ["Major", "Minor"]
const HARMONY_MAX_VALUE = 10
const HARMONY_MIN_VALUE = 0
const INVERSION_MAX_VALUE = 10
const INVERSION_MIN_VALUE = 0

export const SharknetDrawer: FC = observer(() => {
  const { sharknet } = useStores()
  const drawerOptions = sharknet?.drawerOptions || {}
  const onChangeForm = (key: string, value: string | number) => {
    sharknet.drawerOptions = {
      ...sharknet.drawerOptions,
      [key]: value,
    }
  }
  const onCompute = () => {
    console.log("handle compute", sharknet?.drawerOptions)
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
          <label style={{ marginRight: 10 }}>
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
