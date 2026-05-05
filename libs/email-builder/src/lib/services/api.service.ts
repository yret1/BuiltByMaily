import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { EmailTemplate } from '../schema/block.types';
import { EMAIL_BUILDER_CONFIG } from '../email-builder.token';

export interface SaveTemplateRequest {
  name: string;
  schema: EmailTemplate;
}

export interface ExportTemplateRequest {
  schema: EmailTemplate;
}

export interface ExportTemplateResponse {
  html: string;
  plainText: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(EMAIL_BUILDER_CONFIG);
  private apiKey = '';
  private workspaceId = '';

  configure(apiKey: string, workspaceId: string): void {
    this.apiKey = apiKey;
    this.workspaceId = workspaceId;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'X-API-Key': this.apiKey });
  }

  /** Fetch all templates for the workspace. */
  listTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(
      `${this.config.apiUrl}/api/v1/templates`,
      { headers: this.headers, params: { workspaceId: this.workspaceId } }
    );
  }

  /** Fetch a single template by id. */
  getTemplate(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(
      `${this.config.apiUrl}/api/v1/templates/${id}`,
      { headers: this.headers }
    );
  }

  /** Save (create or update) a template. */
  saveTemplate(templateId: string | null, req: SaveTemplateRequest): Observable<EmailTemplate> {
    if (templateId) {
      return this.http.put<EmailTemplate>(
        `${this.config.apiUrl}/api/v1/templates/${templateId}`,
        req,
        { headers: this.headers }
      );
    }
    return this.http.post<EmailTemplate>(
      `${this.config.apiUrl}/api/v1/templates`,
      { ...req, workspaceId: this.workspaceId },
      { headers: this.headers }
    );
  }

  /** Export a template schema to HTML via MJML server-side rendering. */
  exportTemplate(templateId: string, req: ExportTemplateRequest): Observable<ExportTemplateResponse> {
    return this.http.post<ExportTemplateResponse>(
      `${this.config.apiUrl}/api/v1/export`,
      { ...req, templateId },
      { headers: this.headers }
    );
  }
}
