import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import { TaskStatus } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController (Unit)', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be defined', () => {
    expect(controller).to.be.ok;
  });

  it('should create and retrieve tasks', async () => {
    const task = await controller.create({
      title: 'Write Mocha Tests',
      description: 'Using mocha-junit-reporter',
      status: TaskStatus.IN_PROGRESS,
    });

    expect(task.id).to.equal('1');
    expect(task.title).to.equal('Write Mocha Tests');

    const tasks = await controller.findAll();
    expect(tasks).to.have.lengthOf(1);

    const found = await controller.findById('1');
    expect(found.title).to.equal('Write Mocha Tests');
  });

  it('should update a task', async () => {
    await controller.create({ title: 'Task' });
    const updated = await controller.update('1', { status: TaskStatus.COMPLETED });
    expect(updated.status).to.equal(TaskStatus.COMPLETED);
  });

  it('should delete a task', async () => {
    await controller.create({ title: 'Task to delete' });
    await controller.remove('1');
    const tasks = await controller.findAll();
    expect(tasks).to.have.lengthOf(0);
  });
});
