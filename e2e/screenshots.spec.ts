import { expect, test } from '@playwright/test';

import { abrirEm, avancar } from './relogio';

/**
 * Gera as imagens usadas no README (`npm run screenshots`).
 * O relógio é fixado para que as capturas sejam reproduzíveis.
 */
const PASTA = 'docs/screenshots';
const AGORA = new Date('2026-11-03T14:27:42-03:00');

const telas = [
  { nome: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { nome: 'tablet', viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 },
  { nome: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
] as const;

for (const tela of telas) {
  test.describe(tela.nome, () => {
    test.use({
      viewport: tela.viewport,
      deviceScaleFactor: tela.deviceScaleFactor,
      isMobile: tela.nome !== 'desktop',
      hasTouch: tela.nome !== 'desktop',
    });

    test(`captura ${tela.nome}`, async ({ page }) => {
      await abrirEm(page, AGORA);
      await expect(page.getByRole('timer')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      await page.screenshot({ path: `${PASTA}/${tela.nome}.jpg`, quality: 85 });
    });
  });
}

test('captura estado encerrado', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const quaseNoFim = new Date('2026-11-27T23:59:58-03:00');
  await abrirEm(page, quaseNoFim);
  await avancar(page, quaseNoFim, 2);
  await expect(page.locator('.encerrada')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  await page
    .locator('app-contagem-regressiva')
    .screenshot({ path: `${PASTA}/encerrada.jpg`, quality: 85 });
});
