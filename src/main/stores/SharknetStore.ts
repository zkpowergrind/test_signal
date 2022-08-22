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
    harmonies: 1,
    inversion: 1,
    spread: 50,
  }

  constructor() {
    makeObservable(this, {
      drawerOptions: observable,
    })
  }
}
