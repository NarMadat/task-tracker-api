import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './task.entity';

@Injectable()
export class TasksService {
  private tasks: Map<string, Task> = new Map();
  private idCounter = 1;

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async findById(id: string): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const id = String(this.idCounter++);
    const now = new Date().toISOString();
    const newTask: Task = {
      id,
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || TaskStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, newTask);
    return newTask;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const existing = await this.findById(id);

    const updatedTask: Task = {
      ...existing,
      ...updateTaskDto,
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    this.tasks.delete(id);
  }

  clear(): void {
    this.tasks.clear();
    this.idCounter = 1;
  }
}
