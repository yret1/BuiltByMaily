import { nanoid } from 'nanoid';
import type { EmailTemplate } from './block.types';

/** A ready-to-use welcome/marketing email template for development and demos. */
export function createDefaultTemplate(): EmailTemplate {
  return {
    id: nanoid(10),
    name: 'Welcome Email',
    subject: 'Welcome to BuiltByMaily!',
    previewText: 'The email builder that ships with you.',
    backgroundColor: '#f4f4f4',
    contentWidth: 600,
    fontFamily: 'Arial, sans-serif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: nanoid(10),
        type: 'spacer',
        height: 24,
      },
      {
        id: nanoid(10),
        type: 'text',
        content: '<p style="margin:0;font-size:28px;font-weight:700;color:#1a1a2e;">BuiltByMaily</p>',
        fontSize: 28,
        fontFamily: 'Arial, sans-serif',
        color: '#1a1a2e',
        align: 'center',
        padding: { top: 24, right: 32, bottom: 8, left: 32 },
      },
      {
        id: nanoid(10),
        type: 'image',
        src: '',
        alt: 'Hero banner',
        width: 'full',
        align: 'center',
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      {
        id: nanoid(10),
        type: 'text',
        content:
          '<h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#1a1a2e;">Welcome aboard! 👋</h1>' +
          '<p style="margin:0;font-size:16px;line-height:1.6;color:#444;">Thanks for signing up. We\'re thrilled to have you. ' +
          'Your account is ready and you can start building beautiful emails right away.</p>',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#444444',
        align: 'left',
        padding: { top: 32, right: 40, bottom: 16, left: 40 },
      },
      {
        id: nanoid(10),
        type: 'button',
        label: 'Get started →',
        href: 'https://example.com',
        backgroundColor: '#007bff',
        textColor: '#ffffff',
        borderRadius: 6,
        align: 'center',
        padding: { top: 16, right: 40, bottom: 24, left: 40 },
      },
      {
        id: nanoid(10),
        type: 'divider',
        color: '#e0e0e0',
        thickness: 1,
        style: 'solid',
        padding: { top: 8, right: 40, bottom: 8, left: 40 },
      },
      {
        id: nanoid(10),
        type: 'columns',
        gap: 24,
        padding: { top: 24, right: 40, bottom: 24, left: 40 },
        columns: [
          {
            width: 33,
            blocks: [
              {
                id: nanoid(10),
                type: 'text',
                content:
                  '<p style="margin:0 0 6px;font-weight:700;color:#1a1a2e;">📧 Templates</p>' +
                  '<p style="margin:0;font-size:14px;color:#666;line-height:1.5;">Drag, drop, and customise beautiful email templates in minutes.</p>',
                fontSize: 14,
                fontFamily: 'Arial, sans-serif',
                color: '#666666',
                align: 'left',
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
              },
            ],
          },
          {
            width: 33,
            blocks: [
              {
                id: nanoid(10),
                type: 'text',
                content:
                  '<p style="margin:0 0 6px;font-weight:700;color:#1a1a2e;">🚀 Export</p>' +
                  '<p style="margin:0;font-size:14px;color:#666;line-height:1.5;">Export pixel-perfect HTML via MJML — compatible with all major email clients.</p>',
                fontSize: 14,
                fontFamily: 'Arial, sans-serif',
                color: '#666666',
                align: 'left',
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
              },
            ],
          },
          {
            width: 33,
            blocks: [
              {
                id: nanoid(10),
                type: 'text',
                content:
                  '<p style="margin:0 0 6px;font-weight:700;color:#1a1a2e;">🔑 API</p>' +
                  '<p style="margin:0;font-size:14px;color:#666;line-height:1.5;">Embed with one component. Works in any Angular app with a single API key.</p>',
                fontSize: 14,
                fontFamily: 'Arial, sans-serif',
                color: '#666666',
                align: 'left',
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
              },
            ],
          },
        ],
      },
      {
        id: nanoid(10),
        type: 'divider',
        color: '#e0e0e0',
        thickness: 1,
        style: 'solid',
        padding: { top: 8, right: 40, bottom: 8, left: 40 },
      },
      {
        id: nanoid(10),
        type: 'text',
        content:
          '<p style="margin:0;font-size:12px;color:#999;text-align:center;">' +
          'You received this email because you signed up for BuiltByMaily.<br/>' +
          '<a href="#" style="color:#999;">Unsubscribe</a> · ' +
          '<a href="#" style="color:#999;">Privacy Policy</a>' +
          '</p>',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        color: '#999999',
        align: 'center',
        padding: { top: 16, right: 40, bottom: 24, left: 40 },
      },
      {
        id: nanoid(10),
        type: 'spacer',
        height: 24,
      },
    ],
  };
}
