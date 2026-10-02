import { InjectionToken, inject } from '@angular/core';

import { proximaBlackFriday } from '../utils/tempo';

/** Fonte do "agora" em epoch ms. Abstraída para permitir testes determinísticos. */
export type Relogio = () => number;

export const RELOGIO = new InjectionToken<Relogio>('RELOGIO', {
  providedIn: 'root',
  factory: () => () => Date.now(),
});

/** Data até a qual a contagem regressiva é feita. Padrão: fim da próxima Black Friday. */
export const DATA_ALVO = new InjectionToken<Date>('DATA_ALVO', {
  providedIn: 'root',
  factory: () => proximaBlackFriday(new Date(inject(RELOGIO)())),
});
