import { TestBed } from '@angular/core/testing';

import { blackFridayDoAno } from '../utils/tempo';
import { DATA_ALVO, RELOGIO } from './tempo.tokens';

describe('tokens de tempo', () => {
  it('RELOGIO usa Date.now por padrão', () => {
    spyOn(Date, 'now').and.returnValue(123_456);

    expect(TestBed.inject(RELOGIO)()).toBe(123_456);
  });

  it('DATA_ALVO aponta para a próxima Black Friday a partir do RELOGIO', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: RELOGIO, useValue: () => new Date(2026, 11, 25).getTime() }],
    });

    expect(TestBed.inject(DATA_ALVO)).toEqual(blackFridayDoAno(2027));
  });
});
