import { useState, useMemo, useEffect, useGlobalState, useRef } from "../lib";
import { ITreeTodoItem } from "../types";

const useExpandedItems = (items: ITreeTodoItem[]) => {
  const [expandedItems, setExpandedItems] = useGlobalState<Set<number>>("expandedItems", new Set());
  const isInitializedRef = useRef(false);

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

  const toggleExpanded = (itemId: number) => {
    const targetItem = findItemInTree(items, itemId);
    if (!targetItem) return;

    if (expandedItems.has(itemId)) {
      setExpandedItems(new Set(Array.from(expandedItems).filter((id) => id !== itemId)));
    } else {
      setExpandedItems(new Set([...expandedItems, itemId]));
    }
  };

  useEffect(() => {
    if (items.length > 0 && !isInitializedRef.current) {
      const getAllItemIds = (items: ITreeTodoItem[]): number[] => {
        return items.reduce((ids: number[], item) => {
          ids.push(item.id);
          if (item.children && item.children.length > 0) {
            ids.push(...getAllItemIds(item.children));
          }
          return ids;
        }, []);
      };

      const allIds = getAllItemIds(items);
      setExpandedItems(new Set(allIds));
      isInitializedRef.current = true;
    }
  }, [items.length]);

  return {
    expandedItems,
    toggleExpanded,
  };
};

export function useWindowedList(
  items: ITreeTodoItem[],
  itemHeight: number,
  containerHeight: number
) {
  const { expandedItems, toggleExpanded } = useExpandedItems(items);
  const [scrollTop, setScrollTop] = useState(0);
  const skipNextScrollRef = useRef(false);

  const flattenedItems = useMemo(() => {
    const result: Array<{
      item: ITreeTodoItem;
      level: number;
    }> = [];

    const processItem = (item: ITreeTodoItem, level: number) => {
      result.push({
        item: {
          ...item,
          level,
          children: item.children
        },
        level,
      });

      if (expandedItems.has(item.id) && item.children) {
        item.children.forEach((child) => processItem(child, level + 1));
      }
    };

    (items as ITreeTodoItem[]).forEach((item) => processItem(item, 0));

    return result;
  }, [items, expandedItems]);

  const onScroll = (e: { currentTarget: HTMLElement }) => {
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false; 
      return;
    }
    const newScrollTop = Math.max(0, e.currentTarget.scrollTop);
    setScrollTop(newScrollTop);
  };

  const { visibleItems, topPadding } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.floor(visibleCount / 2);
  
    const sliceStart = Math.max(0, startIndex - buffer);
    const sliceEnd = Math.min(flattenedItems.length, startIndex + visibleCount + buffer);
  
    const visibleSlice = flattenedItems.slice(sliceStart, sliceEnd);
  
    return {
      visibleItems: visibleSlice.map(({ item }) => item) as ITreeTodoItem[],
      topPadding: sliceStart * itemHeight
    };
  }, [flattenedItems, scrollTop, containerHeight, itemHeight]);

  const totalHeight = useMemo(() => {
    return flattenedItems.length * itemHeight;
  }, [flattenedItems, itemHeight]);

  function scrollToIndex(index: number) {
    skipNextScrollRef.current = true;
  }

  return {
    visibleItems,
    onScroll,
    topPadding,
    totalHeight,
    toggleExpanded,
    expandedItems,
  };
}
