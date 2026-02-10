import { Plugin } from '@database/schemas/plugin.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';

export type PluginDocument = Document<Types.ObjectId, object, Plugin, object> &
  Plugin;

@Injectable()
export class PluginService {
  constructor(
    @InjectModel(Plugin.name)
    private readonly model: Model<Plugin>,
  ) {}

  findAll(): Promise<PluginDocument[]> {
    return this.model.find().exec();
  }

  findAllByType(type: string): Promise<PluginDocument[]> {
    return this.model.find({ type: type }).exec();
  }

  async create(entity: Plugin): Promise<PluginDocument> {
    const plugin = new this.model(entity);

    return await plugin.save();
  }

  async replaceByName(name: string, entity: Plugin): Promise<PluginDocument> {
    const existingPlugin = await this.model.exists({ name }).exec();

    console.log(entity);

    if (!existingPlugin) {
      const plugin = await this.model.create(entity);

      return plugin.save();
    } else {
      await this.model.updateOne({ _id: existingPlugin._id }, entity).exec();

      const plugin = await this.model
        .findOne({ _id: existingPlugin._id })
        .exec();

      return plugin!;
    }
  }
}
