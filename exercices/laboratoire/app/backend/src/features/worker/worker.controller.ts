import { MongoNotFoundException } from '@common/exceptions/mongo-not-found.exception';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { MongooseError } from 'mongoose';
import { Public } from 'nest-keycloak-connect';
import { BodyWorkerDto, CreateWorkerDto } from './worker.dto';
import { WorkerService } from './worker.service';

@Controller('workers')
export class WorkerController {
  constructor(private readonly $worker: WorkerService) {}

  @Get()
  async findAllAction() {
    return await this.$worker.findAll();
  }

  @Get(':worker_id')
  async findOnection(@Param('worker_id') worker_id: string) {
    try {
      return await this.$worker.findOneById(worker_id);
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Public()
  @Post()
  async createAction(@Body() body: CreateWorkerDto) {
    try {
      return await this.$worker.create(body);
    } catch (error) {
      Logger.error(
        `Unable to create Worker: ${error.message}`,
        WorkerController.name,
      );

      if (error instanceof MongooseError) {
        throw new ConflictException('error.worker.unableToUpdate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Public()
  @Put(':worker_id')
  async replaceAction(
    @Param('worker_id') worker_id: string,
    @Body() body: CreateWorkerDto,
  ) {
    try {
      return await this.$worker.replaceById(worker_id, body);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':worker_id')
  async updateAction(
    @Param('worker_id') worker_id: string,
    @Body() body: BodyWorkerDto,
  ) {
    try {
      return await this.$worker.updatePartialById(worker_id, {
        // TODO: body.TODO,   // TODO: implement it
      });
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.worker.unableToUpdate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
