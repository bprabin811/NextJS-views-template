export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
    category?: string;
  }
  
  export type EventCategory = 'Personal' | 'Work' | 'Holiday' | 'Other';