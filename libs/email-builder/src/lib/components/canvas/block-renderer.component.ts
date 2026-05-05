import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type {
  AnyBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  HtmlBlock,
} from '../../schema/block.types';

@Component({
  selector: 'emb-block-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (block().type) {
      @case ('text') {
        <div
          class="emb-block-text"
          [style.font-size.px]="asText().fontSize"
          [style.font-family]="asText().fontFamily"
          [style.color]="asText().color"
          [style.text-align]="asText().align"
          [style.padding]="spacing(asText().padding)"
          [innerHTML]="asText().content"
        ></div>
      }
      @case ('image') {
        <div
          class="emb-block-image"
          [style.text-align]="asImage().align"
          [style.padding]="spacing(asImage().padding)"
        >
          @if (asImage().src) {
            <img
              [src]="asImage().src"
              [alt]="asImage().alt"
              [style.width]="asImage().width === 'full' ? '100%' : asImage().width + 'px'"
            />
          } @else {
            <div class="emb-block-image__placeholder">
              <span>Click to add image</span>
            </div>
          }
        </div>
      }
      @case ('button') {
        <div
          class="emb-block-button"
          [style.text-align]="asButton().align"
          [style.padding]="spacing(asButton().padding)"
        >
          <a
            class="emb-block-button__link"
            [href]="asButton().href || '#'"
            [style.background-color]="asButton().backgroundColor"
            [style.color]="asButton().textColor"
            [style.border-radius.px]="asButton().borderRadius"
          >{{ asButton().label }}</a>
        </div>
      }
      @case ('divider') {
        <div [style.padding]="spacing(asDivider().padding)">
          <hr
            class="emb-block-divider"
            [style.border-color]="asDivider().color"
            [style.border-width.px]="asDivider().thickness"
            [style.border-style]="asDivider().style"
          />
        </div>
      }
      @case ('spacer') {
        <div
          class="emb-block-spacer"
          [style.height.px]="asSpacer().height"
        ></div>
      }
      @case ('columns') {
        <div
          class="emb-block-columns"
          [style.padding]="spacing(asColumns().padding)"
          [style.gap.px]="asColumns().gap"
        >
          @for (col of asColumns().columns; track $index) {
            <div
              class="emb-block-columns__col"
              [style.flex-basis]="col.width + '%'"
            >
              @if (col.blocks.length === 0) {
                <div class="emb-block-columns__empty">Drop blocks here</div>
              }
              @for (b of col.blocks; track b.id) {
                <emb-block-renderer [block]="b" />
              }
            </div>
          }
        </div>
      }
      @case ('html') {
        <div
          class="emb-block-html"
          [innerHTML]="asHtml().content"
        ></div>
      }
      @default {
        <div class="emb-block-unknown">Unknown block type: {{ block().type }}</div>
      }
    }
  `,
  styles: [`
    .emb-block-image__placeholder {
      background: #f0f0f0;
      border: 2px dashed #ccc;
      padding: 40px;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
    .emb-block-button__link {
      display: inline-block;
      padding: 12px 24px;
      text-decoration: none;
      font-weight: 600;
    }
    .emb-block-divider {
      border-top-width: 0;
      margin: 0;
    }
    .emb-block-columns {
      display: flex;
      box-sizing: border-box;
      width: 100%;
    }
    .emb-block-columns__col {
      flex-shrink: 0;
      box-sizing: border-box;
    }
    .emb-block-columns__empty {
      border: 2px dashed #ddd;
      padding: 20px;
      text-align: center;
      color: #ccc;
      font-size: 12px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .emb-block-unknown {
      background: #ffe0e0;
      padding: 8px;
      font-size: 12px;
    }
  `],
})
export class BlockRendererComponent {
  readonly block = input.required<AnyBlock>();

  protected spacing(p: { top: number; right: number; bottom: number; left: number }): string {
    return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
  }

  protected asText() { return this.block() as TextBlock; }
  protected asImage() { return this.block() as ImageBlock; }
  protected asButton() { return this.block() as ButtonBlock; }
  protected asDivider() { return this.block() as DividerBlock; }
  protected asSpacer() { return this.block() as SpacerBlock; }
  protected asColumns() { return this.block() as ColumnsBlock; }
  protected asHtml() { return this.block() as HtmlBlock; }
}
