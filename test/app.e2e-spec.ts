import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TaskStatus } from '../src/tasks/task.entity';

describe('App Endpoints (E2E)', () => {
  let app: INestApplication;

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  after(async () => {
    await app.close();
  });

  describe('Health Probes', () => {
    it('/health (GET) should return 200 with service metadata', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'ok');
      expect(response.body).to.have.property('service', 'task-tracker-api');
      expect(response.body).to.have.property('uptime');
    });

    it('/health/live (GET) should return 200 for Kubernetes liveness', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(response.body).to.deep.equal({
        status: 'ok',
        probe: 'liveness',
      });
    });

    it('/health/ready (GET) should return 200 for Kubernetes readiness', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body).to.deep.equal({
        status: 'ok',
        probe: 'readiness',
      });
    });
  });

  describe('Tasks API CRUD', () => {
    let createdTaskId: string;

    it('/tasks (POST) - should reject invalid payload (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          invalidField: 'Not allowed',
        })
        .expect(400);

      expect(response.body).to.have.property('message');
    });

    it('/tasks (POST) - should create a new task (201 Created)', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Deploy to Kubernetes',
          description: 'Create Helm charts and CI/CD pipelines',
          status: TaskStatus.IN_PROGRESS,
        })
        .expect(201);

      expect(response.body).to.have.property('id');
      expect(response.body.title).to.equal('Deploy to Kubernetes');
      expect(response.body.status).to.equal(TaskStatus.IN_PROGRESS);

      createdTaskId = response.body.id;
    });

    it('/tasks (GET) - should list all tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
    });

    it('/tasks/:id (GET) - should return single task', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(200);

      expect(response.body.id).to.equal(createdTaskId);
      expect(response.body.title).to.equal('Deploy to Kubernetes');
    });

    it('/tasks/:id (PATCH) - should update task status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          status: TaskStatus.COMPLETED,
        })
        .expect(200);

      expect(response.body.status).to.equal(TaskStatus.COMPLETED);
    });

    it('/tasks/:id (DELETE) - should delete task (204 No Content)', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${createdTaskId}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(404);
    });
  });
});
