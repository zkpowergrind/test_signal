import { useContract } from "@starknet-react/core"
import { Abi } from "starknet"

//import CounterAbi from "../abi/counterb.json"
import CounterAbi from "../abi/retrieve_array_test_contract_abi.json"

export function useCounterContract() {
  return useContract({
    abi: CounterAbi as Abi,
    address:
      //"0x05d8a0ddef7d81623f3adb030d2338a26f79c2eb3d4ec322b43041cd5417f58e",
      //"0x05fce2b74494bfe7da1e7f49e55f5edd3a4473545bafccf6923548ad01727efe",
      //"0x03ddf155d92bc8f6bd8ef36e52df2a995cabf66c4c0be1be1d6edac15f3de9a2",
      "0x04fad4d0680abc4a4da354ae76c71f371c7f05a756e7f0b9d1a266c7acb84990",
  })
}

//0x020c51105470e5582197fa20fbb56db5cd1b5fdb7b57768a6f809f19e88c996e
//0x04df1eed1d991708b807286627bd03272f8bdd75573cd7a01ca09007c462b78c
//"0x037e6b872ccf032eb66a1c6e25d4a871d8bdb6aa174e25bff7257398c7df98a8"

//"0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1"
