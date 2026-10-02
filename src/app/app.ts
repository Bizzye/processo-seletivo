import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContagemRegressiva } from './features/contagem-regressiva/contagem-regressiva';

@Component({
  selector: 'app-root',
  imports: [ContagemRegressiva],
  template: `
    <main class="pagina">
      <app-contagem-regressiva />
    </main>
  `,
  styles: `
    .pagina {
      display: grid;
      place-items: center;
      min-block-size: 100dvh;
      padding: clamp(1rem, 4vw, 4rem);
      box-sizing: border-box;
    }

    app-contagem-regressiva {
      inline-size: min(100%, 1080px);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
