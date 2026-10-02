import { Injectable, inject } from '@angular/core';
import { Observable, interval, map, startWith, takeWhile } from 'rxjs';

import { TempoRestante } from '../models/tempo-restante';
import { RELOGIO } from '../tokens/tempo.tokens';
import { calcularTempoRestante } from '../utils/tempo';

export const INTERVALO_DE_ATUALIZACAO_MS = 1000;

@Injectable({ providedIn: 'root' })
export class ContagemRegressivaService {
  private readonly relogio = inject(RELOGIO);

  /**
   * Emite o tempo restante até `alvo` imediatamente (de forma síncrona) e depois a cada segundo.
   * Completa após emitir o estado expirado, liberando o timer.
   */
  contagemAte(alvo: Date): Observable<TempoRestante> {
    const alvoMs = alvo.getTime();

    return interval(INTERVALO_DE_ATUALIZACAO_MS).pipe(
      startWith(0),
      map(() => calcularTempoRestante(alvoMs, this.relogio())),
      takeWhile((tempo) => !tempo.expirado, true),
    );
  }
}
