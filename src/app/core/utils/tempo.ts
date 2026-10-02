import { TempoRestante } from '../models/tempo-restante';

const MS_POR_SEGUNDO = 1000;
const MS_POR_MINUTO = 60 * MS_POR_SEGUNDO;
const MS_POR_HORA = 60 * MS_POR_MINUTO;
const MS_POR_DIA = 24 * MS_POR_HORA;

const NOVEMBRO = 10;
const QUINTA_FEIRA = 4;

/**
 * Decompõe a diferença entre `alvo` e `agora` (ambos em epoch ms) em dias, horas, minutos e
 * segundos. Valores negativos são tratados como zero, nunca exibimos tempo negativo.
 */
export function calcularTempoRestante(alvo: number, agora: number): TempoRestante {
  const restante = Math.max(alvo - agora, 0);

  return {
    dias: Math.floor(restante / MS_POR_DIA),
    horas: Math.floor((restante % MS_POR_DIA) / MS_POR_HORA),
    minutos: Math.floor((restante % MS_POR_HORA) / MS_POR_MINUTO),
    segundos: Math.floor((restante % MS_POR_MINUTO) / MS_POR_SEGUNDO),
    expirado: restante === 0,
  };
}

/**
 * Último segundo da Black Friday do ano informado (horário local).
 * A Black Friday é a sexta-feira seguinte à quarta quinta-feira de novembro (Thanksgiving).
 */
export function blackFridayDoAno(ano: number): Date {
  const diaDaSemanaDoPrimeiroDeNovembro = new Date(ano, NOVEMBRO, 1).getDay();
  const primeiraQuinta = 1 + ((QUINTA_FEIRA - diaDaSemanaDoPrimeiroDeNovembro + 7) % 7);
  const quartaQuinta = primeiraQuinta + 21;

  return new Date(ano, NOVEMBRO, quartaQuinta + 1, 23, 59, 59);
}

/** Próxima Black Friday que ainda não terminou, a partir de `referencia`. */
export function proximaBlackFriday(referencia: Date): Date {
  const desteAno = blackFridayDoAno(referencia.getFullYear());

  return referencia.getTime() <= desteAno.getTime()
    ? desteAno
    : blackFridayDoAno(referencia.getFullYear() + 1);
}
