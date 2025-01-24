export type Data<T> =
  {
    key: bigint,
    value: T
  }

export interface TreeNode<T>
{
  data: Data<T> | null,
  parent: TreeNode<T> | null,
  left: TreeNode<T> | null,
  right: TreeNode<T> | null,
}
