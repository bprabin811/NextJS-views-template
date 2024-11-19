"use client";
import { Button } from "@/components/ui/button";
import { dummyEvents } from "@/lib/calendar-data";
import { MyEvent } from "@/types/calendar";
import { format } from "date-fns";
import { getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  SlotInfo,
  ToolbarProps,
  View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-styles.css";
import { EventDialog } from "./event-dialog";
import { EventForm } from "./event-form";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const [events, setEvents] = useState<MyEvent[]>(dummyEvents);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>();

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo.start);
    setSelectedEvent(null);
    setShowEventForm(true);
    if (slotInfo.end) {
      const endDate = new Date(slotInfo.end);
      endDate.setDate(endDate.getDate() - 1);
      setSelectedEndDate(endDate);
    } else {
      setSelectedEndDate(undefined);
    }
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setSelectedSlot(new Date());
    setShowEventForm(true);
  };

  const handleSaveEvent = (eventData: Omit<MyEvent, "id">) => {
    if (selectedEvent) {
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id ? { ...eventData, id: event.id } : event
        )
      );
    } else {
      const newEvent: MyEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setShowEventDialog(false);
    }
  };

  const handleEditEvent = () => {
    setShowEventDialog(false);
    setShowEventForm(true);
  };

  const CustomToolbar: React.FC<ToolbarProps<MyEvent>> = (props) => {
    const { label, onNavigate, onView } = props;

    return (
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => onNavigate("TODAY")}>
            Today
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => onNavigate("PREV")}>
              Previous
            </Button>
            <Button variant="outline" onClick={() => onNavigate("NEXT")}>
              Next
            </Button>
          </div>
          <h2 className="text-xl font-semibold">{label}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleAddEvent}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </Button>
          <div className="flex space-x-2">
            {["month", "week", "day"].map((viewType) => (
              <Button
                key={viewType}
                variant="outline"
                onClick={() => onView(viewType as View)}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full px-4">
      <div className="h-[calc(85vh-3rem)] rounded-lg shadow-sm">
        <BigCalendar
          localizer={localizer}
          events={events}
          defaultView="month"
          views={["month", "week", "day"]}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          components={{
            toolbar: CustomToolbar,
          }}
        />
      </div>

      <EventDialog
        event={selectedEvent}
        open={showEventDialog}
        onClose={() => setShowEventDialog(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <EventForm
        event={selectedEvent}
        open={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setSelectedEndDate(undefined);
        }}
        onSave={handleSaveEvent}
        selectedDate={selectedSlot ?? undefined}
        selectedEndDate={selectedEndDate}
      />
    </div>
  );
}
