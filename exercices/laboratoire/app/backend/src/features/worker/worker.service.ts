import { MongoNotFoundException } from '@common/exceptions/mongo-not-found.exception';
import { Worker } from '@database/schemas/worker.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';

export type WorkerDocument = Document<Types.ObjectId, object, Worker, object> &
  Worker;

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name)
    private readonly model: Model<Worker>,
  ) {}

  async findAll(): Promise<WorkerDocument[]> {
    return await this.model.find().exec();
  }

  async findOneById(worker_id: string): Promise<WorkerDocument> {
    const worker = await this.model.findOne({ worker_id }).exec();

    if (!worker) {
      throw new MongoNotFoundException('error.worker.notFound');
    }

    return worker;
  }

  async create(entity: Worker): Promise<WorkerDocument> {
    const worker = new this.model(entity);

    await worker.save();
    return worker;
  }

  async replaceById(
    worker_id: string,
    entity: Worker,
  ): Promise<WorkerDocument> {
    const existingWorker = await this.model.exists({ worker_id }).exec();

    if (!existingWorker) {
      const worker = await this.model.create({ worker_id, state: 'ONLINE' });
      return worker.save();
    }

    const worker = await this.model.findOneAndUpdate(
      { worker_id },
      { $set: entity },
      {
        new: true,
      },
    );

    return worker!;
  }

  async updatePartialById(
    worker_id: string,
    filter: Record<string, any>,
  ): Promise<WorkerDocument> {
    const worker = await this.model
      .findOneAndUpdate({ worker_id }, { $set: filter }, { new: true })
      .exec();

    if (!worker) {
      throw new MongoNotFoundException('error.worker.notFound');
    }

    return worker;
  }
}
