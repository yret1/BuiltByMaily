import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailBuilderComponent } from '@builtbymaily/email-builder';
import type { TemplateSavedEvent, TemplateExportedEvent, BuilderConfig } from '@builtbymaily/email-builder';

interface EmbInitPayload {
  apiKey: string;
  workspaceId: string;
  templateId?: string;
  apiUrl: string;
  config?: BuilderConfig;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EmailBuilderComponent],
  template: `
    @if (ready()) {
      <emb-email-builder
        [apiKey]="initPayload()!.apiKey"
        [workspaceId]="initPayload()!.workspaceId"
        [templateId]="initPayload()!.templateId ?? null"
        [config]="initPayload()!.config ?? {}"
        (templateSaved)="onSaved($event)"
        (templateExported)="onExported($event)"
      />
    } @else {
      <div class="emb-init-wait">Waiting for configuration…</div>
    }
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .emb-init-wait {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 14px;
      color: #aaa;
    }
  `],
})
export class AppComponent implements OnInit {
  protected readonly ready = signal(false);
  protected readonly initPayload = signal<EmbInitPayload | null>(null);

  ngOnInit(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.data?.type === 'EMB_INIT') {
        this.initPayload.set(event.data.payload as EmbInitPayload);
        this.ready.set(true);
      }
    });

    // Signal to host that the iframe is ready to receive EMB_INIT
    window.parent.postMessage({ type: 'EMB_READY' }, '*');
  }

  onSaved(event: TemplateSavedEvent): void {
    window.parent.postMessage({ type: 'EMB_SAVED', payload: event }, '*');
  }

  onExported(event: TemplateExportedEvent): void {
    window.parent.postMessage({ type: 'EMB_EXPORTED', payload: event }, '*');
  }
}
