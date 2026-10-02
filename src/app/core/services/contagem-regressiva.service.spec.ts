import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { TempoRestante } from '../models/tempo-restante';
import { RELOGIO } from '../tokens/tempo.tokens';
import {
  ContagemRegressivaService,
  INTERVALO_DE_ATUALIZACAO_MS,
} from './contagem-regressiva.service';

describe('ContagemRegressivaService', () => {
  const inicio = new Date(2026, 10, 27, 23, 59, 56).getTime();
  const alvo = new Date(2026, 10, 27, 23, 59, 59);

  let agora: number;
  let servico: ContagemRegressivaService;
  let emissoes: TempoRestante[];
  let completou: boolean;
  let inscricao: Subscription | undefined;

  /** Avança relógio e timers juntos, um intervalo por vez (como no navegador). */
  const avancarSegundos = (segundos: number): void => {
    for (let i = 0; i < segundos; i++) {
      agora += INTERVALO_DE_ATUALIZACAO_MS;
      jasmine.clock().tick(INTERVALO_DE_ATUALIZACAO_MS);
    }
  };

  beforeEach(() => {
    jasmine.clock().install();
    agora = inicio;
    emissoes = [];
    completou = false;

    TestBed.configureTestingModule({
      providers: [{ provide: RELOGIO, useValue: () => agora }],
    });
    servico = TestBed.inject(ContagemRegressivaService);
  });

  afterEach(() => {
    inscricao?.unsubscribe();
    jasmine.clock().uninstall();
  });

  const inscrever = (): void => {
    inscricao = servico.contagemAte(alvo).subscribe({
      next: (tempo) => emissoes.push(tempo),
      complete: () => (completou = true),
    });
  };

  it('emite o tempo restante de forma síncrona ao se inscrever', () => {
    inscrever();

    expect(emissoes.length).toBe(1);
    expect(emissoes[0]).toEqual(jasmine.objectContaining({ segundos: 3, expirado: false }));
  });

  it('atualiza a cada segundo', () => {
    inscrever();

    avancarSegundos(2);

    expect(emissoes.map((tempo) => tempo.segundos)).toEqual([3, 2, 1]);
  });

  it('emite o estado expirado e completa ao atingir o alvo', () => {
    inscrever();

    avancarSegundos(3);

    expect(emissoes.at(-1)?.expirado).toBeTrue();
    expect(completou).toBeTrue();

    avancarSegundos(5);
    expect(emissoes.length).toBe(4);
  });

  it('completa imediatamente se o alvo já passou', () => {
    agora = alvo.getTime() + 60_000;
    inscrever();

    expect(emissoes).toEqual([{ dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true }]);
    expect(completou).toBeTrue();
  });

  it('para de emitir após o unsubscribe', () => {
    inscrever();
    inscricao?.unsubscribe();

    avancarSegundos(2);

    expect(emissoes.length).toBe(1);
  });
});
