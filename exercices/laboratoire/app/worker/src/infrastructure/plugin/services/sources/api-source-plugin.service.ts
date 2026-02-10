import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AxiosHeaders, AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { SourcePlugin } from '../../../../domain/plugin/source-plugin';
import { z, ZodType } from 'zod';
import { Plugin, PluginFormDefinition } from '../../plugin-form';
import { StepError } from '../../../../domain/plugin/StepError';

export type HttpParam = { name: string; value: any };

const HttpParamsSchema = z.object({
  name: z.string(),
  value: z.any(),
});

export const ApiAuthenticationSchema = z.object({
  type: z.union([z.literal('basic'), z.literal('bearer'), z.literal('apiKey')]),
  credentials: z.string(),
});

export const ApiPaginationSchema = z.object({
  enabled: z.boolean(),
  pageParam: z.string().optional(),
  totalPagesPath: z.string().optional(),
  itemsPerPage: z.number().int().positive().optional(),
});

export const ApiSourceConfigSchema = z.object({
  url: z.url().or(z.ipv4()).or(z.ipv6()),
  method: z.union([
    z.literal('GET'),
    z.literal('POST'),
    z.literal('PUT'),
    z.literal('PATCH'),
    z.literal('DELETE'),
  ]),
  headers: z.array(HttpParamsSchema).optional(),
  queryParams: z.array(HttpParamsSchema).optional(),
  body: z.array(HttpParamsSchema).optional(),
  authentication: ApiAuthenticationSchema.optional(),
  dataPath: z.string().optional(),
  pagination: ApiPaginationSchema.optional(),
});

export const ApiSourcePluginFormDefinition: PluginFormDefinition = {
  inLine: false,
  contextualHelper: `### Configuration API Source
Permet de récupérer des données via une requête HTTP.

**Configuration :**
- **URL** : L'adresse de l'API.
- **Method** : GET, POST, PUT, etc.
- **Headers** : Liste de clés/valeurs pour les entêtes HTTP.
- **Body Parameters** : Paramètres envoyés dans le corps de la requête (format JSON).`,
  fields: [
    {
      name: 'url',
      label: 'URL',
      controlType: 'control',
      formType: 'input',
      inputType: 'text',
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'method',
      label: 'Method',
      controlType: 'control',
      formType: 'select',
      selectValues: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
      ],
      optional: false,
      validators: [{ name: 'required' }],
    },
    {
      name: 'headers',
      label: 'Headers',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'name',
            label: 'Key',
            controlType: 'control',
            formType: 'input',
            validators: [],
          },
          {
            name: 'value',
            label: 'Value',
            controlType: 'control',
            formType: 'input',
            validators: [],
          },
        ],
        validators: [],
      },
    },
    {
      name: 'body',
      label: 'Body Parameters',
      controlType: 'array',
      group: {
        inLine: true,
        fields: [
          {
            name: 'name',
            label: 'Parameter Name',
            controlType: 'control',
            formType: 'input',
            validators: [],
          },
          {
            name: 'value',
            label: 'Parameter Value (JSON string)',
            controlType: 'control',
            formType: 'textarea',
            validators: [{ name: 'json' }],
          },
        ],
        validators: [],
      },
    },
  ],
  validators: [],
};

export type ApiSourceConfig = z.infer<typeof ApiSourceConfigSchema>;

@Injectable()
export class ApiSourcePluginService implements SourcePlugin<ApiSourceConfig> {
  protected config: ApiSourceConfig;
  protected $http: HttpService;

  constructor() {
    this.$http = new HttpService();
  }
  getPluginDefinition(): Omit<Plugin, 'id'> {
    return {
      name: 'api-source',
      type: 'source',
      formDefinition: ApiSourcePluginFormDefinition,
    };
  }
  getSchema(): ZodType {
    return ApiSourceConfigSchema;
  }
  get name(): string {
    return this.getPluginDefinition().name;
  }

  initialize(config: ApiSourceConfig): void {
    const parseResult = this.getSchema().safeParse(config);

    if (!parseResult.success) {
      throw parseResult.error;
    }
    this.config = parseResult.data as ApiSourceConfig;
  }

  protected prepareHeaders() {
    const headers = new AxiosHeaders();
    headers.setAccept('application/json');
    headers.setContentType('application/json');

    for (const header of this.config.headers || []) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      headers.set(header.name, header.value);
    }

    switch (this.config.authentication?.type) {
      case 'basic':
        headers.setAuthorization(
          `Basic ${Buffer.from(this.config.authentication.credentials).toString('base64')}`,
        );
        break;
      case 'bearer':
        headers.setAuthorization(
          `Bearer ${this.config.authentication.credentials}`,
        );
        break;
      case 'apiKey':
        headers.set('X-API-KEY', this.config.authentication.credentials);
        break;
    }
    return headers;
    // headers.append('Authorization', 'Bearer ' + this.config.authentication.credentials);
  }

  protected prepareQueryParams() {
    const { queryParams, pagination } = this.config;

    const params: Record<string, any> = {};

    for (const param of queryParams || []) {
      params[param.name] = param.value;
    }

    if (pagination && pagination.enabled && pagination.pageParam) {
      params[pagination.pageParam] = 1;
    }

    return params;
  }

  protected prepareBody() {
    const { body } = this.config;

    const bodyParams: Record<string, any> = {};

    for (const bodyParam of body || []) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        bodyParams[bodyParam.name] = JSON.parse(bodyParam.value);
      } catch (e) {
        Logger.error(e.message, ApiSourcePluginService.name);
        throw new Error(`Invalid JSON in body parameter: ${bodyParam.name}`);
      }
    }

    return bodyParams;
  }

  async extract(workflow_name: string, job_id: any, step_id: any) {
    if (!this.config) {
      throw new StepError(
        job_id,
        workflow_name,
        step_id,
        this.name,
        'API Source Plugin not initialized',
      );
    }

    const aggregatedData: Record<string, any>[] = [];
    let currentPage = 1;
    let totalPages = 1;

    // Pagination handling
    while (currentPage <= totalPages) {
      const requestConfig = {
        url: this.config.url,
        method: this.config.method || 'GET',
        headers: this.prepareHeaders(),
        params: this.prepareQueryParams(),
        data: this.prepareBody(),
      } as AxiosRequestConfig;

      const response = await lastValueFrom(this.$http.request(requestConfig));

      const pageData = this.extractDataFromResponse(
        response.data,
        this.config.dataPath || '',
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      aggregatedData.push(...pageData);

      if (this.config.pagination?.enabled) {
        if (this.config.pagination.totalPagesPath) {
          totalPages = this.getNestedValue(
            response.data,
            this.config.pagination.totalPagesPath,
          );
        }

        currentPage++;

        if (pageData.length === 0) break;
      } else {
        break;
      }
    }

    return aggregatedData;
  }

  protected extractDataFromResponse(
    responseData: any,
    dataPath: string = '',
  ): any[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.getNestedValue(responseData, dataPath) || responseData;
  }

  protected getNestedValue(obj: any, path: string): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}
