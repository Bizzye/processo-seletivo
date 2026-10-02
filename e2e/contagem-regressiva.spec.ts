import { expect, test } from '@playwright/test';

import { abrirEm, avancar } from './relogio';

// Fuso fixado em America/Sao_Paulo (playwright.config.ts): Black Friday 2026 termina em
// 27/11/2026 23:59:59 -03:00.
const UM_DE_NOVEMBRO = new Date('2026-11-01T12:00:00-03:00');

test.describe('Contagem regressiva da Black Friday', () => {
  test('exibe o tempo restante até a próxima Black Friday', async ({ page }) => {
    await abrirEm(page, UM_DE_NOVEMBRO);

    await expect(page).toHaveTitle(/Black Friday/);
    await expect(page.getByRole('img', { name: /Black Friday/ })).toBeVisible();
    await expect
      .poll(() => page.getByRole('img').evaluate((img: HTMLImageElement) => img.currentSrc))
      .toMatch(/black-friday\.avif$/);
    await expect(page.locator('.valor')).toHaveText(['26', '11', '59', '59']);
    await expect(page.locator('.rotulo')).toHaveText(['Dias', 'Horas', 'Minutos', 'Segundos']);
    await expect(page.getByRole('timer')).toHaveAttribute(
      'aria-label',
      'Faltam 26 dias, 11 horas, 59 minutos e 59 segundos',
    );
  });

  test('atualiza a cada segundo', async ({ page }) => {
    await abrirEm(page, UM_DE_NOVEMBRO);
    await expect(page.locator('.valor').last()).toHaveText('59');

    await avancar(page, UM_DE_NOVEMBRO, 1);
    await expect(page.locator('.valor').last()).toHaveText('58');

    await avancar(page, UM_DE_NOVEMBRO, 60);
    await expect(page.locator('.valor')).toHaveText(['26', '11', '58', '59']);
  });

  test('exibe "Encerrada" quando a Black Friday termina com a página aberta', async ({ page }) => {
    const quaseNoFim = new Date('2026-11-27T23:59:57-03:00');
    await abrirEm(page, quaseNoFim);
    await expect(page.locator('.valor')).toHaveText(['00', '00', '00', '02']);

    await avancar(page, quaseNoFim, 3);

    await expect(page.locator('.encerrada')).toHaveText('Encerrada');
    await expect(page.getByRole('timer')).toHaveAttribute('aria-label', /encerrada/);
  });

  test('passa a contar para o ano seguinte depois da Black Friday', async ({ page }) => {
    await abrirEm(page, new Date('2026-11-28T00:00:00-03:00'));

    // 28/11/2026 00:00:00 -> 26/11/2027 23:59:59
    await expect(page.locator('.valor')).toHaveText(['363', '23', '59', '59']);
  });

  test('mantém a contagem sobre a faixa amarela sem rolagem horizontal', async ({ page }) => {
    await page.goto('/');

    const imagem = await page.getByRole('img').boundingBox();
    const contagem = await page.getByRole('timer').boundingBox();
    expect(imagem).not.toBeNull();
    expect(contagem).not.toBeNull();

    if (imagem && contagem) {
      expect(contagem.x).toBeGreaterThan(imagem.x + imagem.width * 0.15);
      expect(contagem.x + contagem.width).toBeLessThan(imagem.x + imagem.width * 0.6);
      expect(contagem.y).toBeGreaterThan(imagem.y + imagem.height * 0.7);
      expect(contagem.y + contagem.height).toBeLessThan(imagem.y + imagem.height * 0.95);
    }

    const temRolagemHorizontal = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(temRolagemHorizontal).toBe(false);
  });

  test('carrega sem erros no console', async ({ page }) => {
    const erros: string[] = [];
    page.on('console', (mensagem) => {
      if (mensagem.type() === 'error') erros.push(mensagem.text());
    });
    page.on('pageerror', (erro) => erros.push(erro.message));

    await page.goto('/');
    await expect(page.getByRole('timer')).toBeVisible();

    expect(erros).toEqual([]);
  });
});
