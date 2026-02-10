import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { HttpService } from '@nestjs/axios';

describe('JobController', () => {
  let controller: JobController;

  const mockJobService = {
    create: jest.fn(),
    initHistory: jest.fn(),
    execute: jest.fn(),
  };

  const mockHttpService = {} as any; // Not used directly in controller logic

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        { provide: JobService, useValue: mockJobService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    })
      // Use token inference by class reference: override by class to keep DI consistent
      .overrideProvider(JobService)
      .useValue(mockJobService)
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .compile();

    controller = module.get(JobController);
  });

  it('devrait retourner les identifiants et l’historique et lancer l’exécution', () => {
    const fakeBody = { any: 'payload' } as any;
    const job = {
      job_id: 'job-123',
      name: 'My Job',
      sources: [],
      transforms: [],
      destinations: [],
    } as any;
    const history = {
      job_history: { a: 1 },
      job_history_steps: [{ b: 2 }],
    } as any;

    mockJobService.create.mockReturnValue(job);
    mockJobService.initHistory.mockReturnValue(history);
    mockJobService.execute.mockResolvedValue(undefined);

    const res = controller.executeJobAction(fakeBody);

    expect(mockJobService.create).toHaveBeenCalledWith(fakeBody);
    expect(mockJobService.initHistory).toHaveBeenCalledWith(job);
    expect(mockJobService.execute).toHaveBeenCalledWith(job);
    expect(res).toEqual({
      job_id: 'job-123',
      job_history: history.job_history,
      job_history_steps: history.job_history_steps,
    });
  });

  it("ne doit pas jeter d'erreur si l'exécution échoue (le contrôleur renvoie quand même la réponse)", async () => {
    const fakeBody = { any: 'payload' } as any;
    const job = {
      job_id: 'job-err',
      name: 'My Job',
      sources: [],
      transforms: [],
      destinations: [],
    } as any;
    const history = {
      job_history: { a: 3 },
      job_history_steps: [{ b: 4 }],
    } as any;

    mockJobService.create.mockReturnValue(job);
    mockJobService.initHistory.mockReturnValue(history);
    mockJobService.execute.mockRejectedValue(new Error('boom'));

    const res = controller.executeJobAction(fakeBody);

    expect(res).toEqual({
      job_id: 'job-err',
      job_history: history.job_history,
      job_history_steps: history.job_history_steps,
    });
  });
});
