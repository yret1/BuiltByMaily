import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideEmailBuilder } from '@builtbymaily/email-builder';

bootstrapApplication(AppComponent, {
  providers: [
    provideEmailBuilder({ apiUrl: 'http://localhost:3000' }),
  ],
}).catch((err) => console.error(err));
