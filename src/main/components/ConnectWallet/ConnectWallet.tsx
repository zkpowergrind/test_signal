import { Button } from "@mui/material"
import { useConnectors, useStarknet } from "@starknet-react/core"
export default function ConnectWallet() {
  const { account } = useStarknet()
  const { available, connect, disconnect } = useConnectors()

  if (account) {
    return (
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "row",
          position: "relative",
          alignItems: "center",
        }}
      >
        <p>Account: {account}</p>
        <Button
          onClick={() => disconnect()}
          color="error"
          variant="contained"
          size="small"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "row",
        position: "relative",
        alignItems: "center",
      }}
    >
      {available.map((connector) => (
        <Button
          key={connector.id()}
          onClick={() => connect(connector)}
          color="primary"
          variant="contained"
          size="small"
        >
          {`Connect ${connector.name()}`}
        </Button>
      ))}
    </div>
  )
}
