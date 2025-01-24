import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import * as crypto from 'crypto'

import * as func from './functions'
import * as types from './types'


const testFiles =
  [
    `./assets/test-images/test-image-01.png`,
    `./assets/test-images/test-image-02.png`,
    `./assets/test-images/test-image-03.png`,
    `./assets/test-images/test-image-04.png`,
    `./assets/test-images/test-image-05.png`,
    `./assets/test-images/test-image-06.png`,
    `./assets/test-images/test-image-07.png`,
    `./assets/test-images/test-image-08.png`,
    `./assets/test-images/test-image-09.png`,
    `./assets/test-images/test-image-10.png`,
  ]

const generateTestServers = (n: number): Array<types.VirtualNode> =>
  Array.from(Array(n).keys()).map(i => i + 1).map(i =>({
    id: "ttestServerId" + i,
    name: "ttestServerName" + i,
  }))
const testServers = generateTestServers(3)
const calcIndex = func.calculateNodeIndex(testServers)
if (E.isRight(calcIndex))
{
  calcIndex.right.printSortedKeysCircular()
}

const main =
  async () => {
    for (const testFilePath of testFiles) {
      await pipe(
        calcIndex,
        TE.fromEither,
        TE.chain(nodeIndex => pipe(
          func.getFileFromFilePath(testFilePath),
          TE.fromEither,
          TE.chain(func.calculateFileToIndex(nodeIndex)),
          TE.map(_ => `${(testFilePath)} ==> ${_.value.id}`)
        )),
        TE.map(console.log)
      )()
    }
  }

main()