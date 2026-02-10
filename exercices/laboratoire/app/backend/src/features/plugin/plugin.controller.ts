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
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MongooseError } from 'mongoose';
import { Public } from 'nest-keycloak-connect';
import { CreatePluginDto, QueryPluginDto } from './plugin.dto';
import { PluginDocument, PluginService } from './plugin.service';

@Controller('plugins')
export class PluginController {
  constructor(private readonly $plugin: PluginService) {}

  @Get()
  async findAllAction(
    @Query() query: QueryPluginDto,
  ): Promise<PluginDocument[]> {
    if (query.type === undefined) {
      return await this.$plugin.findAll();
    }

    return await this.$plugin.findAllByType(query.type);
  }

  @Post()
  async createAction(@Body() body: CreatePluginDto): Promise<PluginDocument> {
    try {
      return await this.$plugin.create(body);
    } catch (error) {
      Logger.error(
        `Unable to create Plugin: ${JSON.stringify(error.message)}`,
        PluginController.name,
      );

      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException('error.plugin.notFound');
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.plugin.unableToCreate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @Public()
  @Put(':name')
  async replaceAction(
    @Param('name') name: string,
    @Body() body: CreatePluginDto,
  ): Promise<PluginDocument> {
    try {
      return await this.$plugin.replaceByName(name, body);
    } catch (error) {
      if (error instanceof MongoNotFoundException) {
        throw new NotFoundException('error.plugin.notFound');
      }

      if (error instanceof MongooseError) {
        throw new ConflictException('error.plugin.unableToCreate');
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
