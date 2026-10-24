import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import { TaskStatus } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService (Unit)', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be defined', () => {
    expect(service).to.be.ok;
  });

  describe('create and findAll', () => {
    it('should create a task with default status and return it in findAll', async () => {
      const created = await service.create({
        title: 'Learn DevOps',
        description: 'Set up CI/CD pipeline',
      });

      expect(created).to.have.property('id', '1');
      expect(created.title).to.equal('Learn DevOps');
      expect(created.description).to.equal('Set up CI/CD pipeline');
      expect(created.status).to.equal(TaskStatus.PENDING);
      expect(created.createdAt).to.be.a('string');

      const all = await service.findAll();
      expect(all).to.have.lengthOf(1);
      expect(all[0]).to.deep.equal(created);
    });

    it('should create a task with explicit status', async () => {
      const created = await service.create({
        title: 'Build Docker image',
        status: TaskStatus.IN_PROGRESS,
      });

      expect(created.status).to.equal(TaskStatus.IN_PROGRESS);
    });
  });

  describe('findById', () => {
    it('should return the task if found', async () => {
      const created = await service.create({ title: 'Task 1' });
      const found = await service.findById(created.id);
      expect(found).to.deep.equal(created);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      try {
        await service.findById('non-existent');
        expect.fail('Should have thrown NotFoundException');
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundException);
        expect((err as NotFoundException).message).to.include('not found');
      }
    });
  });

  describe('update', () => {
    it('should update task title and status', async () => {
      const created = await service.create({ title: 'Initial title' });
      const updated = await service.update(created.id, {
        title: 'Updated title',
        status: TaskStatus.COMPLETED,
      });

      expect(updated.title).to.equal('Updated title');
      expect(updated.status).to.equal(TaskStatus.COMPLETED);
      expect(updated.id).to.equal(created.id);
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      try {
        await service.update('999', { title: 'New' });
        expect.fail('Should have thrown NotFoundException');
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundException);
      }
    });
  });

  describe('remove', () => {
    it('should remove existing task', async () => {
      const created = await service.create({ title: 'To Delete' });
      await service.remove(created.id);

      const all = await service.findAll();
      expect(all).to.have.lengthOf(0);
    });

    it('should throw NotFoundException when deleting non-existent task', async () => {
      try {
        await service.remove('999');
        expect.fail('Should have thrown NotFoundException');
      } catch (err) {
        expect(err).to.be.instanceOf(NotFoundException);
      }
    });
  });
});
