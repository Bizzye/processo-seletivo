/** Tempo restante até a data-alvo, já decomposto em unidades. */
export interface TempoRestante {
  readonly dias: number;
  readonly horas: number;
  readonly minutos: number;
  readonly segundos: number;
  /** `true` quando a data-alvo já foi atingida (todas as unidades zeradas). */
  readonly expirado: boolean;
}
