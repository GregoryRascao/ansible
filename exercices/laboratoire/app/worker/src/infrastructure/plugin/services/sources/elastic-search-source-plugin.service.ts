import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { ApiSourcePluginService } from './api-source-plugin.service';
import { Plugin } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

@Injectable()
export class ElasticSearchSourcePluginService extends ApiSourcePluginService {
  protected override prepareBody(from: number = 0, size: number = 10): any {
    return { ...super.prepareBody(), from, size };
  }

  override getPluginDefinition(): Omit<Plugin, 'id'> {
    const def = super.getPluginDefinition();
    return {
      ...def,
      name: 'elastic-search-source',
    };
  }
  public override get name(): string {
    return this.getPluginDefinition().name;
  }

  public override prepareQueryParams(): any {
    const pagination = { trackTotalHits: true };
    return { ...super.prepareQueryParams(), ...pagination };
  }

  public async extract(
    workflow_name: string,
    job_id: any,
    step_id: any,
  ): Promise<any[]> {
    if (!this.config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'Source options not initialized',
      );
    }

    const aggregatedData: any[] = [];
    let from = 0;
    const size = 10000;

    const requestConfig = {
      url: this.config.url,
      method: this.config.method || 'GET',
      headers: this.prepareHeaders(),
      params: this.prepareQueryParams(),
      data: this.prepareBody(from, size),
    } as AxiosRequestConfig;
    const response = await lastValueFrom(this.$http.request(requestConfig));
    aggregatedData.push(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...this.extractDataFromResponse(
        response.data,
        this.config.dataPath || '',
      ),
    );

    const xTotalCount = response.headers['x-total-count'];
    const xResultCount = response.headers['x-result-count'];

    from += Number(xResultCount);
    const total = Number(xTotalCount);

    while (from < total) {
      requestConfig.data = {
        ...this.prepareBody(0, size),
        search_after: [aggregatedData[aggregatedData.length - 1].id],
      };
      const res = await lastValueFrom(this.$http.request(requestConfig));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      aggregatedData.push(...res.data);
      from += res.data.length;
    }

    return aggregatedData;
  }
}


