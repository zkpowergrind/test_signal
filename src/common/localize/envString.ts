export const envString = (() => {
  const os = navigator.userAgent.indexOf("Mac") != -1 ? "macOS" : "PC"

  switch (os) {
    case "macOS":
      return {
        cmdOrCtrl: "Cmd",
      }
    case "PC":
      return {
        cmdOrCtrl: "Ctrl",
      }
  }
})()
