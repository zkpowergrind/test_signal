import styled from "@emotion/styled"
import { ArrowLeft } from "@mui/icons-material"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useRef } from "react"
import { useStores } from "../../hooks/useStores"

const NavBackButton = styled.button`
  -webkit-appearance: none;
  border: none;
  outline: none;
  height: 2rem;
  background: none;
  color: inherit;
  cursor: pointer;

  &:hover {
    background: none;
    color: ${({ theme }) => theme.secondaryTextColor};
  }
`

interface ArrowIconProps {
  isOpen: boolean
}

const ArrowIcon: FC<ArrowIconProps> = ({ isOpen }) => (
  <ArrowLeft
    style={{
      transition: "transform 0.1s ease",
      transform: `scale(1.5) rotateZ(${isOpen ? "0deg" : "-90deg"})`,
    }}
  />
)
const TrackName = styled.span`
  font-weight: bold;
  margin-right: 2em;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14rem;
  min-width: 3em;
  cursor: pointer;
`

export const StarknetMenuButton: FC = observer(() => {
  const { rootViewStore } = useStores()
  const open = rootViewStore.openStarknetDrawer
  const onClickNavBack = useCallback(
    () =>
      (rootViewStore.openStarknetDrawer = !rootViewStore.openStarknetDrawer),
    [rootViewStore]
  )

  const ref = useRef<HTMLButtonElement>(null)

  return (
    <>
      <NavBackButton
        ref={ref}
        onClick={onClickNavBack}
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ArrowIcon isOpen={open} />
      </NavBackButton>
      <TrackName onClick={onClickNavBack}>StarkNet</TrackName>
    </>
  )
})
