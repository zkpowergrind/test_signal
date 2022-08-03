import styled from "@emotion/styled"
import { Forum, Help, Settings } from "@mui/icons-material"
import { Tooltip } from "@mui/material"
import Color from "color"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import ArrangeIcon from "../../images/icons/arrange.svg"
import PianoIcon from "../../images/icons/piano.svg"
import TempoIcon from "../../images/icons/tempo.svg"
import Logo from "../../images/logo-circle.svg"
import ConnectWallet from "../ConnectWallet/ConnectWallet"
import { FileMenuButton } from "./FileMenuButton"
import { UserButton } from "./UserButton"

const BannerContainer = styled.div`
  background: ${({ theme }) => theme.themeColor};
  padding: 0 16px;
  height: 3rem;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  a {
    display: flex;
  }
`

const LogoIcon = styled(Logo)`
  width: 1.5rem;
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => Color(theme.backgroundColor).darken(0.2).hex()};
`

export const Tab = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center; 
  padding: 0.5rem 1rem;
  font-size: 0.7rem;
  border-top: solid 0.1rem transparent;
  color: ${({ theme }) => theme.secondaryTextColor};

  &.active {
    color: ${({ theme }) => theme.textColor};
    background: ${({ theme }) => theme.backgroundColor};
    border-top-color: ${({ theme }) => theme.themeColor};
  }

  &:hover {
    background: ${({ theme }) =>
      Color(theme.backgroundColor).darken(0.1).hex()};
  }
}
`

export const TabTitle = styled.span`
  margin-left: 0.4rem;

  @media (max-width: 850px) {
    display: none;
  }
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const IconStyle: CSSProperties = {
  width: "1.3rem",
  height: "1.3rem",
  fill: "currentColor",
}

export const Navigation: FC = observer(() => {
  const {
    rootViewStore,
    authStore: { user },
    router,
  } = useStores()

  return (
    <Container>
      <FileMenuButton />

      <Tooltip
        title={`${localized("switch-tab", "Switch Tab")} [Cmd+1]`}
        placement="bottom"
        enterDelay={300}
        enterNextDelay={500}
      >
        <Tab
          className={router.path === "/track" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/track"), [])}
        >
          <PianoIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>{localized("piano-roll", "Piano Roll")}</TabTitle>
        </Tab>
      </Tooltip>

      <Tooltip
        title={`${localized("switch-tab", "Switch Tab")} [Cmd+2]`}
        placement="bottom"
        enterDelay={300}
        enterNextDelay={500}
      >
        <Tab
          className={router.path === "/arrange" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/arrange"), [])}
        >
          <ArrangeIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>{localized("arrange", "Arrange")}</TabTitle>
        </Tab>
      </Tooltip>

      <Tooltip
        title={`${localized("switch-tab", "Switch Tab")} [Cmd+3]`}
        placement="bottom"
        enterDelay={300}
        enterNextDelay={500}
      >
        <Tab
          className={router.path === "/tempo" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/tempo"), [])}
        >
          <TempoIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>{localized("tempo", "Tempo")}</TabTitle>
        </Tab>
      </Tooltip>
      <ConnectWallet />

      <FlexibleSpacer />

      <Tab
        onClick={useCallback(() => (rootViewStore.openDeviceDialog = true), [])}
      >
        <Settings style={IconStyle} />
        <TabTitle>{localized("settings", "Settings")}</TabTitle>
      </Tab>

      <Tab onClick={useCallback(() => (rootViewStore.openHelp = true), [])}>
        <Help style={IconStyle} />
        <TabTitle>{localized("help", "Help")}</TabTitle>
      </Tab>



      <UserButton />
    </Container>
  )
})
