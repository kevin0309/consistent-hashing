import * as stream from "stream"


export type CalculatedHash =
  {
    hashCode: string
    hashValue: bigint
  }

export type VirtualNode =
  {
    id: string,
    name: string
  }
export type CalculatedVirtualNode = VirtualNode & CalculatedHash

export type VirtualFile =
  {
    name: string,
    rs: stream.Readable
  }
export type CalculatedVirtualFile = VirtualFile & CalculatedHash