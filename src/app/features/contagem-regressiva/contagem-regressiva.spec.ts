import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DATA_ALVO, RELOGIO } from '../../core/tokens/tempo.tokens';
import { ContagemRegressiva } from './contagem-regressiva';

describe('ContagemRegressiva', () => {
  const alvo = new Date(2026, 10, 27, 23, 59, 59);
  // 26 dias, 1 hora, 0 minutos e 59 segundos antes do alvo.
  const inicio = new Date(2026, 10, 1, 22, 59, 0).getTime();

  let agora: number;
  let relogio: jasmine.Spy<() => number>;
  let fixture: ComponentFixture<ContagemRegressiva>;
  let elemento: HTMLElement;

  const criar = (): void => {
    TestBed.configureTestingModule({
      imports: [ContagemRegressiva],
      providers: [
        { provide: RELOGIO, useValue: relogio },
        { provide: DATA_ALVO, useValue: alvo },
      ],
    });
    fixture = TestBed.createComponent(ContagemRegressiva);
    elemento = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  };

  const avancar = (ms: number): void => {
    agora += ms;
    jasmine.clock().tick(ms);
    fixture.detectChanges();
  };

  const textos = (seletor: string): string[] =>
    Array.from(elemento.querySelectorAll(seletor), (no) => no.textContent?.trim() ?? '');

  const timer = (): HTMLElement => elemento.querySelector<HTMLElement>('[role="timer"]')!;

  beforeEach(() => {
    jasmine.clock().install();
    agora = inicio;
    relogio = jasmine.createSpy('relogio').and.callFake(() => agora);
  });

  afterEach(() => {
    fixture.destroy();
    jasmine.clock().uninstall();
  });

  it('exibe a arte da campanha com texto alternativo e dimensões fixas', () => {
    criar();
    const imagem = elemento.querySelector('img')!;

    expect(imagem.getAttribute('alt')).toContain('Black Friday');
    expect(imagem.getAttribute('width')).toBe('1080');
    expect(imagem.getAttribute('height')).toBe('720');
  });

  it('exibe as quatro unidades com dois dígitos', () => {
    criar();

    expect(textos('.valor')).toEqual(['26', '01', '00', '59']);
    expect(textos('.rotulo')).toEqual(['Dias', 'Horas', 'Minutos', 'Segundos']);
    expect(textos('.divisor').length).toBe(3);
  });

  it('descreve o tempo restante para leitores de tela', () => {
    criar();

    expect(timer().getAttribute('aria-label')).toBe(
      'Faltam 26 dias, 1 hora, 0 minutos e 59 segundos',
    );
  });

  it('atualiza a contagem a cada segundo', () => {
    criar();

    avancar(1000);
    expect(textos('.valor')).toEqual(['26', '01', '00', '58']);

    avancar(59_000);
    expect(textos('.valor')).toEqual(['26', '00', '59', '59']);
  });

  it('exibe "Encerrada" quando o alvo é atingido', () => {
    agora = alvo.getTime() - 1000;
    criar();

    avancar(1000);

    expect(textos('.valor')).toEqual([]);
    expect(elemento.querySelector('.encerrada')?.textContent?.trim()).toBe('Encerrada');
    expect(timer().getAttribute('aria-label')).toBe('A Black Friday foi encerrada');
  });

  it('libera o timer ao ser destruído', () => {
    criar();
    relogio.calls.reset();

    fixture.destroy();
    jasmine.clock().tick(5000);

    expect(relogio).not.toHaveBeenCalled();
  });
});
