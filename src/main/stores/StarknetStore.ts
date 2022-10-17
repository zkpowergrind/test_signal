import { makeObservable, observable } from "mobx"

export interface DrawerOptions {
  contract?: string
  keyN?: string
  keyC?: string
  harmonies: number
  inversion: number
  spread: number
}

export class StarknetStore {
  drawerOptions: DrawerOptions = {
    contract: "Shearing",
    keyN: "C",
    keyC: "Major",
    harmonies: 0,
    inversion: 0,
    spread: 50,
  }

  constructor() {
    makeObservable(this, {
      drawerOptions: observable,
    })
  }
}
