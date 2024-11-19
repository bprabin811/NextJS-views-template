import { MyEvent } from "@/types/calendar";

export const dummyEvents: MyEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(2024, 10, 20, 10, 0),
    end: new Date(2024, 10, 20, 11, 30),
    description: 'Weekly team sync',
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Project Review',
    start: new Date(2024, 10, 21, 14, 0),
    end: new Date(2024, 10, 21, 15, 0),
    description: 'Q4 project status review',
    location: 'Virtual'
  },
  {
    id: '3',
    title: 'Client Call',
    start: new Date(2024, 10, 22, 9, 0),
    end: new Date(2024, 10, 22, 10, 0),
    description: 'Product demo with client',
    location: 'Zoom'
  }
];