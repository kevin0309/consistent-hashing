import { Data, TreeNode } from './types'


export class BinarySearchTree<T>
{
  private rootNode: TreeNode<T>

  constructor() {
    this.rootNode = this.generateEmptyNode(null, null)
  }

  private generateEmptyNode(parent: TreeNode<T> | null, data: Data<T> | null)
  {
    return { parent, data, left: null, right: null }
  }

  private pushRecur(parent: TreeNode<T>, data: Data<T>): void
  {
    if (parent.data === null)
    {
      parent.data = data
      return
    }
    else
    {
      const det = data.key - parent.data.key
      if (det === 0n)
        throw new Error(`same key detected.(${String(parent.data.key)})`)
      else if (det > 0n)
      {
        if (parent.right === null)
        {
          parent.right = this.generateEmptyNode(parent, data)
          return
        }
        else
        {
          return this.pushRecur(parent.right, data)
        }
      }
      else
      {
        if (parent.left === null)
        {
          parent.left = this.generateEmptyNode(parent, data)
          return
        }
        else
        {
          return this.pushRecur(parent.left, data)
        }
      }
    }
  }
  public push(arg: Data<T>): this
  {
    try
    {
      this.pushRecur(this.rootNode, arg)
      return this
    }
    catch (e)
    {
      this.rootNode = this.generateEmptyNode(null, null)
      throw new Error(`BinarySearchTree error(${e})`)
    }
  }
  public pushAll(args: Array<Data<T>>): this
  {
    args.forEach(arg => this.push(arg))
    return this
  }

  private findRecur(parent: TreeNode<T>, key: bigint): TreeNode<T> | null
  {
    if (parent.data === null)
    {
      return null
    }
    else
    {
      const det = key - parent.data.key
      if (det === 0n)
        return parent
      else if (det > 0n)
      {
        if (parent.right === null)
        {
          return null
        }
        else
        {
          return this.findRecur(parent.right, key)
        }
      }
      else
      {
        if (parent.left === null)
        {
          return null
        }
        else
        {
          return this.findRecur(parent.left, key)
        }
      }
    }
  }
  public find(key: bigint): Data<T> | null
  {
    const res = this.findRecur(this.rootNode, key)
    return res === null ? null : res.data
  }

  private findMaxInSubTreeRecur(target: TreeNode<T>): TreeNode<T>
  {
    if (target.right === null)
    {
      return target
    }
    else
    {
      return this.findMaxInSubTreeRecur(target.right)
    }
  }
  private findMinInSubTreeRecur(target: TreeNode<T>): TreeNode<T>
  {
    if (target.left === null)
    {
      return target
    }
    else
    {
      return this.findMinInSubTreeRecur(target.left)
    }
  }
  private findLeftChildedInParentRecur(target: TreeNode<T>): TreeNode<T> | null
  {
    if (target.parent === null)
      return null
    else
    {
      if (target.parent.left === target)
        return target.parent
      else
        return this.findLeftChildedInParentRecur(target.parent)
    }
  }
  private findRightChildedInParentRecur(target: TreeNode<T>): TreeNode<T> | null
  {
    if (target.parent === null)
      return null
    else
    {
      if (target.parent.right === target)
        return target.parent
      else
        return this.findRightChildedInParentRecur(target.parent)
    }
  }

  public findNext(key: bigint): Data<T> | null
  {
    const target = this.findRecur(this.rootNode, key)
    if (target === null)
    {
      this.push({ key, value: {} as T })
      const next = this.findNext(key)
      this.pop(key)
      return next
    }
    else
    {
      if (target.right !== null)
        return this.findMinInSubTreeRecur(target.right).data
      else
      {
        const firstLeftChildedParent = this.findLeftChildedInParentRecur(target)
        if (firstLeftChildedParent === null)
          return null
        else
          return firstLeftChildedParent.data
      }
    }
  }
  public findPrev(key: bigint): Data<T> | null
  {
    const target = this.findRecur(this.rootNode, key)
    if (target === null)
    {
      this.push({ key, value: {} as T })
      const next = this.findPrev(key)
      this.pop(key)
      return next
    }
    else
    {
      if (target.left !== null)
        return this.findMaxInSubTreeRecur(target.left).data
      else
      {
        const firstRightChildedParent = this.findRightChildedInParentRecur(target)
        if (firstRightChildedParent === null)
          return null
        else
          return firstRightChildedParent.data
      }
    }
  }
  public findNextCircular(key: bigint): Data<T> | null
  {
    const next = this.findNext(key)
    if (next === null)
      return this.findMinInSubTreeRecur(this.rootNode).data
    else
      return next
  }
  public findPrevCircular(key: bigint): Data<T> | null
  {
    const prev = this.findPrev(key)
    if (prev === null)
      return this.findMaxInSubTreeRecur(this.rootNode).data
    else
      return prev
  }

  public pop(key: bigint): Data<T> | null
  {
    const target = this.findRecur(this.rootNode, key)
    if (target === null)
      return null
    else
    {
      if (target.left === null && target.right === null)
      {
        if (target.parent !== null)
        {
          if (target.parent.left?.data?.key === key)
          {
            target.parent.left = null
          }
          else
          {
            target.parent.right = null
          }
        }
        else
        {
          this.rootNode = this.generateEmptyNode(null, null)
        }
        return target.data
      }
      else if (target.left !== null && target.right === null)
      {
        if (target.parent !== null)
        {
          if (target.parent.left?.data?.key === key)
          {
            target.parent.left = target.left
          }
          else
          {
            target.parent.right = target.left
          }
          target.left.parent = target.parent
        }
        else
        {
          target.left.parent = null
          this.rootNode = target.left
        }
        return target.data
      }
      else if (target.left === null && target.right !== null)
      {
        if (target.parent !== null)
        {
          if (target.parent.left?.data?.key === key)
          {
            target.parent.left = target.right
          }
          else
          {
            target.parent.right = target.right
          }
          target.right.parent = target.parent
        }
        else
        {
          target.right.parent = null
          this.rootNode = target.right
        }
        return target.data
      }
      else if (target.left !== null && target.right !== null)
      {
        const candidate = this.findMaxInSubTreeRecur(target.left)
        if (target.parent !== null)
        {
          if (target.parent.left?.data?.key === key)
          {
            target.parent.left = candidate
          }
          else
          {
            target.parent.right = candidate
          }
          candidate.parent = target.parent
          candidate.right = target.right
          candidate.right.parent = candidate
        }
        else
        {
          candidate.parent = null
          candidate.right = target.right
          candidate.right.parent = candidate
          this.rootNode = candidate
        }
        return target.data
      }
      else
        return null
    }
  }

  public printSortedKeysCircular()
  {
    let target = this.rootNode.data
    while (true)
    {
      if (target === null)
        break
      console.log(target.key + ` / ` + (target.value as any).id)
      const next = this.findNextCircular(target.key)
      if (next === this.rootNode.data)
        break
      target = next
    }
  }
}

// const genArg =
const bst = new BinarySearchTree()
bst
  .pushAll([
    // { key: 10n, value: true },
    // { key: 3n, value: true },
    // { key: 30n, value: true },
    // { key: 20n, value: true },
    // { key: 31n, value: true },
    // { key: 13n, value: true },
    // { key: 23n, value: true },
    // { key: 21n, value: true },
    // { key: 27n, value: true },
  ])

// console.log(bst.findNextCircular(3n))
// console.log(bst.findPrevCircular(21n))