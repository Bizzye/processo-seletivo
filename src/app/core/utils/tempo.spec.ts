import { blackFridayDoAno, calcularTempoRestante, proximaBlackFriday } from './tempo';

describe('utils/tempo', () => {
  describe('calcularTempoRestante', () => {
    const agora = new Date(2026, 10, 1, 12, 0, 0).getTime();

    it('decompõe a diferença em dias, horas, minutos e segundos', () => {
      const alvo = agora + (((2 * 24 + 3) * 60 + 4) * 60 + 5) * 1000;

      expect(calcularTempoRestante(alvo, agora)).toEqual({
        dias: 2,
        horas: 3,
        minutos: 4,
        segundos: 5,
        expirado: false,
      });
    });

    it('descarta os milissegundos (arredonda para baixo)', () => {
      expect(calcularTempoRestante(agora + 1999, agora)).toEqual(
        jasmine.objectContaining({ segundos: 1, expirado: false }),
      );
    });

    it('marca como expirado e zera tudo quando o alvo é exatamente agora', () => {
      expect(calcularTempoRestante(agora, agora)).toEqual({
        dias: 0,
        horas: 0,
        minutos: 0,
        segundos: 0,
        expirado: true,
      });
    });

    it('nunca retorna valores negativos quando o alvo já passou', () => {
      const resultado = calcularTempoRestante(agora - 90_000_000, agora);

      expect(resultado.expirado).toBeTrue();
      expect([resultado.dias, resultado.horas, resultado.minutos, resultado.segundos]).toEqual([
        0, 0, 0, 0,
      ]);
    });

    it('não marca como expirado faltando menos de um segundo', () => {
      expect(calcularTempoRestante(agora + 1, agora)).toEqual(
        jasmine.objectContaining({ segundos: 0, expirado: false }),
      );
    });
  });

  describe('blackFridayDoAno', () => {
    const casos: readonly [ano: number, dia: number][] = [
      [2021, 26],
      [2024, 29],
      [2025, 28],
      [2026, 27],
      [2027, 26],
      [2030, 29],
    ];

    for (const [ano, dia] of casos) {
      it(`retorna ${dia}/11/${ano} às 23:59:59`, () => {
        expect(blackFridayDoAno(ano)).toEqual(new Date(ano, 10, dia, 23, 59, 59));
      });
    }

    it('sempre cai em uma sexta-feira', () => {
      for (let ano = 2020; ano <= 2040; ano++) {
        expect(blackFridayDoAno(ano).getDay()).withContext(`ano ${ano}`).toBe(5);
      }
    });
  });

  describe('proximaBlackFriday', () => {
    it('retorna a deste ano quando ela ainda não chegou', () => {
      expect(proximaBlackFriday(new Date(2026, 9, 2))).toEqual(blackFridayDoAno(2026));
    });

    it('retorna a deste ano durante o próprio dia da Black Friday', () => {
      expect(proximaBlackFriday(new Date(2026, 10, 27, 15, 0, 0))).toEqual(blackFridayDoAno(2026));
    });

    it('retorna a do ano seguinte quando a deste ano já terminou', () => {
      expect(proximaBlackFriday(new Date(2026, 10, 28, 0, 0, 0))).toEqual(blackFridayDoAno(2027));
    });
  });
});
