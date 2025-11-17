import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit } from 'lucide-react';

const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState([
        { id: 1, name: 'Morning Meditation', completed: false },
        { id: 2, name: '30min Exercise', completed: false },
        { id: 3, name: 'Read 20 pages', completed: false },
    ]);
    const [newTask, setNewTask] = useState('');

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), name: newTask.trim(), completed: false }]);
            setNewTask('');
        }
    };

    const removeTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Your Habits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Add Task Form */}
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Add a new habit..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                            />
                            <Button onClick={addTask} className="bg-primary hover:bg-primary/90">
                                <Plus size={16} />
                            </Button>
                        </div>

                        {/* Tasks List */}
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                                >
                                    <span className="flex-1">{task.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="icon">
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTask(task.id)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {tasks.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No habits yet. Add your first habit to get started!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Tasks;