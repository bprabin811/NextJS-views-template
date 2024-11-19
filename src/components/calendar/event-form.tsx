'use client';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MyEvent } from "@/types/calendar";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface EventFormProps {
  event?: MyEvent | null;
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<MyEvent, "id">) => void;
  selectedDate?: Date;
  selectedEndDate?: Date; // Add this prop for multiple date selection
}

const defaultFormData = {
  title: "",
  description: "",
  location: "",
  startDate: "",
  startTime: "00:00",
  endDate: "",
  endTime: "23:59",
};

export function EventForm({
  event,
  open,
  onClose,
  onSave,
  selectedDate,
  selectedEndDate,
}: EventFormProps) {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData(defaultFormData);
      return;
    }

    if (event) {
      // Set form data for existing event
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        startDate: format(event.start, "yyyy-MM-dd"),
        startTime: format(event.start, "HH:mm"),
        endDate: format(event.end, "yyyy-MM-dd"),
        endTime: format(event.end, "HH:mm"),
      });
    } else if (selectedDate) {
      // Set form data for new event
      const startDate = format(selectedDate, "yyyy-MM-dd");
      const endDate = selectedEndDate 
        ? format(selectedEndDate, "yyyy-MM-dd")
        : startDate;

      setFormData({
        ...defaultFormData,
        startDate,
        endDate,
        startTime: "00:00",
        endTime: selectedEndDate ? "23:59" : "23:59",
      });
    }
  }, [event, selectedDate, selectedEndDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);

    onSave({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      start,
      end,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {event ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Add description"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}