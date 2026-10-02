import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ContagemRegressivaService } from '../../core/services/contagem-regressiva.service';
import { DATA_ALVO } from '../../core/tokens/tempo.tokens';

interface UnidadeDeTempo {
  readonly rotulo: string;
  readonly valor: string;
}

const pluralizar = (quantidade: number, singular: string, plural: string): string =>
  `${quantidade} ${quantidade === 1 ? singular : plural}`;

const doisDigitos = (valor: number): string => String(valor).padStart(2, '0');

@Component({
  selector: 'app-contagem-regressiva',
  templateUrl: './contagem-regressiva.html',
  styleUrl: './contagem-regressiva.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContagemRegressiva {
  private readonly contagemRegressiva = inject(ContagemRegressivaService);
  private readonly dataAlvo = inject(DATA_ALVO);

  protected readonly tempo = toSignal(this.contagemRegressiva.contagemAte(this.dataAlvo), {
    requireSync: true,
  });

  protected readonly unidades = computed<readonly UnidadeDeTempo[]>(() => {
    const { dias, horas, minutos, segundos } = this.tempo();

    return [
      { rotulo: 'Dias', valor: doisDigitos(dias) },
      { rotulo: 'Horas', valor: doisDigitos(horas) },
      { rotulo: 'Minutos', valor: doisDigitos(minutos) },
      { rotulo: 'Segundos', valor: doisDigitos(segundos) },
    ];
  });

  protected readonly descricaoAcessivel = computed(() => {
    const { dias, horas, minutos, segundos, expirado } = this.tempo();

    if (expirado) {
      return 'A Black Friday foi encerrada';
    }

    return (
      `Faltam ${pluralizar(dias, 'dia', 'dias')}, ${pluralizar(horas, 'hora', 'horas')}, ` +
      `${pluralizar(minutos, 'minuto', 'minutos')} e ${pluralizar(segundos, 'segundo', 'segundos')}`
    );
  });
}
