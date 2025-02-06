import { ITodoItem, ITreeTodoItem } from "../types";

export function convertToTree(items: ITodoItem[]): ITreeTodoItem[] {
  const itemMap = new Map<number, ITreeTodoItem>();
  
  items.forEach(item => {
    itemMap.set(item.id, {
      ...item,
      level: 0,
      children: []
    });
  });
  
  const rootItems: ITreeTodoItem[] = [];
  
  items.forEach(item => {
    const treeItem = itemMap.get(item.id);
    if (!treeItem) return;
    
    if (item.parentId === null) {
      rootItems.push(treeItem);
    } else {
      const parentItem = itemMap.get(item.parentId);
      if (parentItem) {
        parentItem.children.push(treeItem);
        treeItem.level = parentItem.level + 1;
      } else {
        rootItems.push(treeItem);
      }
    }
  });
  
  return rootItems;
}