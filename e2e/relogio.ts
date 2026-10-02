import { Page } from '@playwright/test';

/**
 * Abre a página com `Date.now()` congelado em `instante`. Os timers continuam rodando de
 * verdade, então a contagem segue atualizando, mas sempre com o mesmo valor, deixando as
 * asserções determinísticas independentemente do tempo de carregamento.
 */
export async function abrirEm(page: Page, instante: Date): Promise<void> {
  await page.clock.setFixedTime(instante);
  await page.goto('/');
}

/** Move o relógio congelado para `segundos` depois de `instante`. */
export async function avancar(page: Page, instante: Date, segundos: number): Promise<void> {
  await page.clock.setFixedTime(new Date(instante.getTime() + segundos * 1000));
}
