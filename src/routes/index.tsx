import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";

import { api } from "../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/")({
  component: TodoApp,
});

function TodoApp() {
  const todos = useQuery(api.todos.list, {});

  const add = useMutation(api.todos.add);
  const toggle = useMutation(api.todos.toggle);
  const remove = useMutation(api.todos.remove);

  const [newTodo, setNewTodo] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    void add({ text: newTodo.trim() });
    setNewTodo("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </form>

          <div className="flex flex-col gap-3">
            {todos === undefined ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4 animate-pulse">
                Loading tasks...
              </p>
            ) : todos.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                No tasks yet. Add one above!
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={(checked) =>
                        void toggle({ id: todo._id, completed: !!checked })
                      }
                      id={`todo-${todo._id}`}
                    />
                    <label
                      htmlFor={`todo-${todo._id}`}
                      className={cn(
                        "text-sm font-medium leading-none cursor-pointer flex-1",
                        todo.completed
                          ? "line-through text-slate-400"
                          : "text-slate-700 dark:text-slate-300",
                      )}
                    >
                      {todo.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void remove({ id: todo._id })}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
