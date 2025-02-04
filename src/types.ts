export interface ITodoItem {
  id: number;
  content: string;
  parentId: number | null;
  completed: boolean;
}

export interface ITreeTodoItem extends ITodoItem {
  children: ITreeTodoItem[];
}