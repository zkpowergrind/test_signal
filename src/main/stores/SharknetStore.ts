import { makeObservable, observable } from "mobx"

export interface DrawerOptions {
  contract?: string
  keyN?: string
  keyC?: string
  harmonies: number
  inversion: number
  spread: number
}

export class SharknetStore {
  drawerOptions: DrawerOptions = {
    harmonies: 0,
    inversion: 0,
    spread: 0,
  }

  constructor() {
    makeObservable(this, {
      drawerOptions: observable,
    })
  }
}
