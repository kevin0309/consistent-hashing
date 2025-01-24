import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import fs from 'fs'
import path from 'path'
import * as crypto from 'crypto'
import * as stream from "stream"

import * as types from './types'
import { BinarySearchTree } from "./util/bst"


export const errorToString = (error: unknown) =>
  error instanceof Error ?
    error.message :
    typeof error === 'string' ?
      error :
      String(error)

export const getFileFromFilePath = (filePath: string): E.Either<string, types.VirtualFile> =>
  fs.existsSync(filePath) ?
    E.right({
      name: path.basename(filePath),
      rs: fs.createReadStream(filePath)
    }) :
    E.left(`getFileFromFilePath: file not found(${filePath})`)

export const digestReadStream = (rs: stream.Readable): TE.TaskEither<string, string> =>
  () => new Promise<E.Either<string, string>>((resolve) => {
    const hash = crypto.createHash('sha256')

    rs.on('data', chunk => hash.update(chunk))
    rs.on('end', () => resolve(E.right(hash.digest('hex'))))
    rs.on('error', err => resolve(E.left(`digestReadStream(): unexpected error occurred: ${errorToString(err)}`)))
  })

export const digestString = (str: string): E.Either<string, string> =>
  E.tryCatch(
    () => pipe(
      crypto.createHash('sha256'),
      hash => hash.update(str),
      hash => hash.digest('hex')
    ),
    e => `digestString(): unexpected error occurred(${errorToString(e)})`
  )

export const hexStringToBigInt = (hexString: string): E.Either<string, bigint> =>
  pipe(
    /^[0-9a-fA-F]+$/.test(hexString) ?
      E.tryCatch(
        () => BigInt(`0x${hexString}`),
        e => `unexpected error occurred: ${errorToString(e)}`
      ) :
      E.left(`Invalid hex string: ${hexString}`),
    E.mapLeft(e => `hexStringToBigInt(): ${e}`)
  )

export const calculateNodeIndex = (nodes: Array<types.VirtualNode>): E.Either<string, BinarySearchTree<types.CalculatedVirtualNode>> =>
  pipe(
    nodes.map(node => pipe(
      E.Do,
      E.let('id', () => node.id),
      E.let('name', () => node.name),
      E.bind('hashCode', ({ id }) => digestString(id)),
      E.bind('hashValue', ({ hashCode }) => hexStringToBigInt(hashCode)),
      E.map(({ id, name, hashCode, hashValue }): types.CalculatedVirtualNode => ({
        id, name, hashCode, hashValue
      }))
    )),
    E.sequenceArray,
    E.map(_ => _.slice()),
    E.map(calcNodes => calcNodes.map(calcNode => ({ key: calcNode.hashValue, value: calcNode }))),
    E.chain(calcNodes => pipe(
      E.Do,
      E.let('tempNodes', () => calcNodes),
      E.let('bst', () => new BinarySearchTree<types.CalculatedVirtualNode>()),
      E.chain(({ tempNodes, bst }) => E.tryCatch(
        () => bst.pushAll(tempNodes),
        e => `unexpected error occurred(${e})`
      ))
    )),
    E.mapLeft(e => `calculateNodeIndex(): ${e}`)
  )

// hash 값이 가장 가까운 next 노드를 찾아 반환한다
export const calculateFileToIndex = (calculatedNodes: BinarySearchTree<types.CalculatedVirtualNode>) => (file: types.VirtualFile) =>
  pipe(
    TE.Do,
    TE.bind('calculatedFile', () => pipe(
      TE.Do,
      TE.bind('hashCode', () => digestReadStream(file.rs)),
      TE.bind('hashValue', ({ hashCode }) => pipe(
        hexStringToBigInt(hashCode),
        TE.fromEither
      )),
      TE.map(({ hashCode, hashValue }): types.CalculatedVirtualFile => ({
        ...file,
        hashCode,
        hashValue
      }))
    )),
    TE.chain(({ calculatedFile }) => pipe(
      calculatedNodes.findNextCircular(calculatedFile.hashValue),
      TE.fromNullable(`next node not found: ${calculatedFile.hashValue}`)
    )),
    TE.mapLeft(e => `calculateFileIndex(): ${e}`)
  )