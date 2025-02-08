import { describe, test, expect } from 'vitest';
import { convertToTree } from '../../../src/utils/treeUtils';
import { ITodoItem } from '../../../src/types';

describe('트리 변환 함수 테스트', () => {
  test('평면 구조의 데이터를 트리 구조로 변환해야 함', () => {
    const flatItems: ITodoItem[] = [
      { id: 1, content: 'Parent 1', parentId: null, completed: false },
      { id: 2, content: 'Child 1', parentId: 1, completed: false },
      { id: 3, content: 'Child 2', parentId: 1, completed: false },
      { id: 4, content: 'Grandchild 1', parentId: 2, completed: false },
    ];

    const result = convertToTree(flatItems);

    expect(result.length).toBe(1); // 루트 아이템 1개
    expect(result[0].id).toBe(1);
    expect(result[0].children.length).toBe(2);
    expect(result[0].children[0].id).toBe(2);
    expect(result[0].children[1].id).toBe(3);
    expect(result[0].children[0].children[0].id).toBe(4);
  });

  test("빈 배열을 입력할 경우 빈 배열을 반환해야 함", () => {
    const result = convertToTree([]);
    expect(result).toEqual([]);
  });

  test("존재하지 않는 parentId를 가지고 있는 경우 루트 노드로 있어야 함", () => {
    const flatItems: ITodoItem[] = [
      { id: 1, content: "Child without Root", parentId: 2, completed: false },
      { id: 2, content: "Child 1", parentId: 3, completed: false },
    ];
  
    const result = convertToTree(flatItems);
  
    expect(result.length).toBe(1);
  });
});