import { useState, useMemo, useEffect } from "../lib";
import { ITodoItem, ITreeTodoItem } from "../types";

export function useWindowedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const initialExpandedItems = useMemo(() => {
    const expanded = new Set<number>();
    const addAllIds = (items: ITreeTodoItem[]) => {
      items.forEach(item => {
        expanded.add(item.id);
        if (item.children) {
          addAllIds(item.children);
        }
      });
    };
    addAllIds(items as ITreeTodoItem[]);
    return expanded;
  }, [items]);

  const [expandedItems, setExpandedItems] =
    useState<Set<number>>(initialExpandedItems);
  const [scrollTop, setScrollTop] = useState(0);

  const [expandedHistory, setExpandedHistory] = useState<Map<number, Set<number>>>(new Map());

  const findItemInTree = (items: ITreeTodoItem[], targetId: number): ITreeTodoItem | null => {
    for (const item of items) {
      if (item.id === targetId) return item;
      if (item.children) {
        const found = findItemInTree(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const flattenedItems = useMemo(() => {
    console.log('Creating flattenedItems, expandedItems:', Array.from(expandedItems));
    const result: Array<{ 
      item: ITreeTodoItem; 
      level: number;
    }> = [];
  
    // 전체 flatten 구조를 변경
    const processItem = (item: ITreeTodoItem, level: number) => {
      result.push({ 
        item: {...item, level},
        level 
      });
  
      // 이 아이템이 expandedItems에 있을 때만 자식들을 처리
      if (expandedItems.has(item.id) && item.children) {
        item.children.forEach(child => processItem(child, level + 1));
      }
    };
  
    (items as ITreeTodoItem[]).forEach(item => processItem(item, 0));
  
    return result;
  }, [items, expandedItems]);

  console.log(
    "flattenedItems:",
    flattenedItems.map(({ item }) => ({
      id: item.id,
      content: item.content,
      level: item.level,
      hasChildren: item.children?.length > 0,
    }))
  );

  const onScroll = (e: { currentTarget: HTMLElement }) => {
    const newScrollTop = Math.max(0, e.currentTarget.scrollTop);
    setScrollTop(newScrollTop);
  };

  const { visibleItems, topPadding } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;

    const visibleSlice = flattenedItems.slice(
      Math.max(0, startIndex - 1),
      Math.min(flattenedItems.length, startIndex + visibleCount + 1)
    );

    return {
      visibleItems: visibleSlice.map(({ item }) => item) as T[],
      topPadding: Math.max(0, startIndex - 1) * itemHeight,
    };
  }, [flattenedItems, scrollTop, containerHeight, itemHeight]);

  const totalHeight = useMemo(() => {
    return flattenedItems.length * itemHeight;
  }, [flattenedItems, itemHeight]);

  const toggleExpanded = (itemId: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        const childrenStates = new Set<number>();
        const saveChildrenState = (item: ITreeTodoItem) => {
          if (item.children) {
            item.children.forEach(child => {
              if (prev.has(child.id)) {
                childrenStates.add(child.id);
                saveChildrenState(child);
              }
            });
          }
        };

        const targetItem = findItemInTree(items as ITreeTodoItem[], itemId);
        if (targetItem) {
          saveChildrenState(targetItem);
          setExpandedHistory(history => {
            const newHistory = new Map(history);
            newHistory.set(itemId, childrenStates);
            return newHistory;
          });

          const removeChildren = (item: ITreeTodoItem) => {
            next.delete(item.id);
            item.children?.forEach(child => removeChildren(child));
          };
          removeChildren(targetItem);
        }
      } else {
        const restoreExpandedState = (item: ITreeTodoItem) => {
          next.add(item.id);
          if (item.children) {
            const childrenHistory = expandedHistory.get(itemId);
            item.children.forEach(child => {
              if (childrenHistory?.has(child.id)) {
                restoreExpandedState(child);
              }
            });
          }
        };

        const targetItem = findItemInTree(items as ITreeTodoItem[], itemId);
        if (targetItem) {
          restoreExpandedState(targetItem);
        }
      }
      return next;
    });
  };

  useEffect(() => {
    console.log(
      "Visible items with levels:",
      visibleItems.map((item) => ({
        id: (item as ITreeTodoItem).id,
        level: (item as ITreeTodoItem).level,
        content: (item as ITreeTodoItem).content,
      }))
    );
  }, [visibleItems]);

  return {
    visibleItems,
    onScroll,
    topPadding,
    totalHeight,
    toggleExpanded,
    expandedItems,
  };
}
