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

  test('중첩된 아이템의 레벨이 올바르게 설정되어야 함', () => {
    const flatItems: ITodoItem[] = [
      { id: 1, content: 'Root', parentId: null, completed: false },
      { id: 2, content: 'Level 1', parentId: 1, completed: false },
      { id: 3, content: 'Level 2', parentId: 2, completed: false },
    ];

    const result = convertToTree(flatItems);

    expect(result[0].level).toBe(0);
    expect(result[0].children[0].level).toBe(1);
    expect(result[0].children[0].children[0].level).toBe(2);
  });

  test('여러 개의 최상위 아이템을 처리할 수 있어야 함', () => {
    const flatItems: ITodoItem[] = [
      { id: 1, content: 'Root 1', parentId: null, completed: false },
      { id: 2, content: 'Root 2', parentId: null, completed: false },
      { id: 3, content: 'Child of Root 1', parentId: 1, completed: false },
    ];

    const result = convertToTree(flatItems);

    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[0].children[0].id).toBe(3);
  });

  test('존재하지 않는 부모 ID를 가진 아이템을 최상위로 처리해야 함', () => {
    const flatItems: ITodoItem[] = [
      { id: 1, content: 'Valid Item', parentId: null, completed: false },
      { id: 2, content: 'Orphaned Item', parentId: 999, completed: false },
    ];

    const result = convertToTree(flatItems);

    expect(result.length).toBe(2);
    expect(result.map(item => item.id)).toContain(2);
  });

  test('트리 변환 시 아이템의 속성이 보존되어야 함', () => {
    const flatItems: ITodoItem[] = [
      { id: 1, content: 'Test Item', parentId: null, completed: true },
    ];

    const result = convertToTree(flatItems);

    expect(result[0]).toMatchObject({
      id: 1,
      content: 'Test Item',
      completed: true,
      level: 0,
      children: []
    });
  });

  test('빈 배열 입력을 처리할 수 있어야 함', () => {
    const result = convertToTree([]);
    expect(result).toEqual([]);
  });
});