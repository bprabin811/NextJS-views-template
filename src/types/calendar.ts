
export interface MyEvent{
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  resourceId?: string;
}