"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Task = {
  id: string;
  title: string;
  description: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      { id: "1", title: "Task 1", description: "Description 1" },
      { id: "2", title: "Task 2", description: "Description 2" },
    ],
  },
  { id: "in-progress", title: "In Progress", tasks: [] },
  { id: "done", title: "Done", tasks: [{ id: "3", title: "Task 3", description: "Description 3" }] },
];

function DraggableTask({
  task,
  column,
  onEdit,
  onDelete,
}: {
  task: Task;
  column: Column;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task, column },
  });

  const getTaskIcon = (columnId: string) => {
    switch (columnId) {
      case "todo":
        return <Circle className="h-4 w-4 text-blue-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`mb-3 shadow-sm transition-shadow hover:shadow-md ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <div
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              className="flex items-center space-x-2 cursor-move flex-grow"
            >
              {getTaskIcon(column.id)}
              <CardTitle className="text-sm font-medium">
                {task.title}
              </CardTitle>
            </div>
            <div className="flex space-x-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                aria-label={`Edit task: ${task.title}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                aria-label={`Delete task: ${task.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs mt-1 line-clamp-4">
            {task.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

function Column({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
}: {
  column: Column;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case "todo":
        return "bg-blue-100 dark:bg-blue-400/10";
      case "in-progress":
        return "bg-yellow-100 dark:bg-yellow-400/10";
      case "done":
        return "bg-green-100 dark:bg-green-400/10";
      default:
        return "bg-muted/50";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 min-h-[400px] ${getColumnColor(column.id)}`}
    >
      <h2 className="font-semibold mb-4 text-muted-foreground">
        {column.title}
      </h2>
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            column={column}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = React.useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [newTask, setNewTask] = React.useState<Task>({
    id: "",
    title: "",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = active.data.current?.task as Task;
    const activeColumn = active.data.current?.column as Column;
    const overColumn = columns.find((col) => col.id === over.id);

    if (!activeTask || !activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      setColumns((prevColumns) => {
        return prevColumns.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== activeTask.id),
            };
          } else if (col.id === overColumn.id) {
            return {
              ...col,
              tasks: [...col.tasks, activeTask],
            };
          } else {
            return col;
          }
        });
      });
    }

    setActiveTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (taskToDelete: Task) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskToDelete.id),
      }))
    );
  };

  const handleAddOrUpdateTask = async () => {
    if (newTask.title.trim() === "") return;

    setIsAdding(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingTask) {
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) =>
            task.id === editingTask.id ? newTask : task
          ),
        }))
      );
    } else {
      const updatedTask = { ...newTask, id: Date.now().toString() };
      setColumns((columns) => {
        const todoColumn = columns.find((col) => col.id === "todo");
        if (!todoColumn) return columns;

        return columns.map((col) =>
          col.id === "todo"
            ? { ...col, tasks: [updatedTask, ...col.tasks] }
            : col
        );
      });
    }

    setNewTask({ id: "", title: "", description: "" });
    setEditingTask(null);
    setIsDialogOpen(false);
    setIsAdding(false);
  };

  return (
    <div className="h-full w-full p-4">
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTask(null);
            setNewTask({ id: "", title: "", description: "" });
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="mb-6">
            <Plus className="mr-2 h-4 w-4" /> Add New Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Edit the details of your task."
                : "Create a new task for your Kanban board."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddOrUpdateTask} disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTask ? "Updating..." : "Adding..."}
                </>
              ) : editingTask ? (
                "Update Task"
              ) : (
                "Add Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={column.tasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <Card className="w-[250px]">
              <CardHeader className="p-3">
                <div className="flex items-center space-x-2">
                  <Circle className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm font-medium">
                    {activeTask.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs mt-1">
                  {activeTask.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
