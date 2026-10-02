# Code Review: versão 2021 → versão 2.0

Revisão do código original (Angular 10, abril de 2021) com foco em boas práticas, arquitetura,
segurança, acessibilidade e manutenção. Cada item traz o problema encontrado, o impacto e a
correção aplicada na v2.0.

**Legenda:** 🔴 crítico (quebra funcionalidade) · 🟠 alto · 🟡 médio · 🔵 baixo

## Resumo

| #   | Severidade | Categoria      | Problema                                                  | Status       |
| --- | ---------- | -------------- | --------------------------------------------------------- | ------------ |
| 1   | 🔴         | Funcionalidade | Data-alvo fixa em 26/11/2021: app parado desde então      | ✅ Corrigido |
| 2   | 🔴         | Funcionalidade | Estado expirado atribui `string` a um objeto              | ✅ Corrigido |
| 3   | 🔴         | CSS            | `flex-direction: coluna` (renomeação em massa)            | ✅ Corrigido |
| 4   | 🟠         | Performance    | `setInterval` nunca liberado no destroy (memory leak)     | ✅ Corrigido |
| 5   | 🟠         | Boas práticas  | `console.log` três vezes por segundo em produção          | ✅ Corrigido |
| 6   | 🟠         | Tipagem        | `any`, `var`, TypeScript sem `strict`                     | ✅ Corrigido |
| 7   | 🟠         | Arquitetura    | Regra de negócio no componente, relógio não injetável     | ✅ Corrigido |
| 8   | 🟠         | Testes         | Suíte quebrada e sem cobertura real                       | ✅ Corrigido |
| 9   | 🟠         | Segurança/Deps | Angular 10 (EOL), TSLint e Protractor descontinuados      | ✅ Corrigido |
| 10  | 🟠         | Segurança      | Hosting sem headers de segurança (CSP, HSTS…)             | ✅ Corrigido |
| 11  | 🟡         | Dependências   | Pacotes não usados (`@angular/fire`, `firebase`, …)       | ✅ Corrigido |
| 12  | 🟡         | Layout         | `vw` + números mágicos + 4 media queries                  | ✅ Corrigido |
| 13  | 🟡         | Fontes         | Peso 900 usado, mas só 400/700 carregados (falso negrito) | ✅ Corrigido |
| 14  | 🟡         | Acessibilidade | `alt="cd"`, sem `h1`, contagem invisível a leitores       | ✅ Corrigido |
| 15  | 🟡         | Performance    | Imagem sem `width`/`height` (CLS) e sem prioridade (LCP)  | ✅ Corrigido |
| 16  | 🟡         | Repositório    | Cache `.firebase/` versionado                             | ✅ Corrigido |
| 17  | 🔵         | Código morto   | `AppRoutingModule` com rotas vazias                       | ✅ Corrigido |
| 18  | 🔵         | Convenções     | Nomenclatura inconsistente (`DataLimite`, `x`)            | ✅ Corrigido |
| 19  | 🔵         | Processo       | Sem CI, lint, formatação ou padrão de commits             | ✅ Corrigido |

---

## 🔴 Críticos

### 1. Data-alvo fixa: o app parou em 2021

```ts
// main.component.ts (antes)
DataLimite = new Date('Nov 26, 2021 23:59:59').getTime();
```

Depois de 26/11/2021 o contador expirou para sempre. Como a campanha é recorrente, a data deveria
ser calculada.

**Correção:** `blackFridayDoAno(ano)` calcula a sexta-feira após a 4ª quinta-feira de novembro e
`proximaBlackFriday(referencia)` escolhe a deste ano ou a do próximo. A data é fornecida pelo
token `DATA_ALVO`, que pode ser sobrescrito via DI para outras campanhas.

### 2. Estado expirado quebrava o template

```ts
tempo: any;
// ...
if (restante < 0) {
  this.tempo = 'EXPIROU'; // string
}
```

O template lia `tempo.dias`, `tempo.horas`… de uma string, então os números simplesmente sumiam
(veja `docs/screenshots/legado.jpg`). O `any` escondeu o erro do compilador.

**Correção:** modelo tipado `TempoRestante` com a flag `expirado`; o template usa `@if` para
exibir "Encerrada". Tempo negativo nunca é exibido (`Math.max(…, 0)`).

### 3. `flex-direction: coluna`

O commit `e52da0b` ("renomeando as variaveis para portugues") fez um _find & replace_ de
`column` → `coluna` que atingiu também o CSS. `coluna` não é um valor válido, o navegador ignora a
declaração e números e rótulos ficaram lado a lado, desalinhados da arte.

**Correção:** layout reescrito; renomeações agora passam pelo compilador (TS estrito +
`strictTemplates`) e por testes E2E que validam a posição da contagem sobre a faixa amarela.

---

## 🟠 Altos

### 4. Timer nunca liberado

`setInterval` era criado como campo da classe e só era limpo quando a contagem expirava. Se o
componente fosse destruído antes, o timer continuava rodando (memory leak).

**Correção:** `ContagemRegressivaService.contagemAte()` retorna um `Observable`
(`interval` + `takeWhile`) consumido com `toSignal`, que cancela a inscrição automaticamente no
destroy. Há teste unitário garantindo que o relógio não é mais consultado após o destroy.

### 5. `console.log` em produção

Três `console.log` por segundo poluíam o console e vazavam detalhes internos.

**Correção:** removidos; regra ESLint `no-console` (apenas `console.error` permitido).

### 6. Tipagem fraca

`tempo: any`, `var`, `let` onde caberia `const`, e o `tsconfig` não tinha `strict`.

**Correção:** `strict`, `noUnusedLocals`, `noUnusedParameters`, `strictTemplates`,
`typeCheckHostBindings`; regras `@typescript-eslint/strict` + `explicit-function-return-type`.

### 7. Regra de negócio acoplada ao componente

Cálculo de datas, timer e apresentação estavam no mesmo lugar, e `new Date()` era chamado
diretamente: impossível testar sem esperar o tempo passar.

**Correção (padrões aplicados):**

- **Funções puras** (`core/utils/tempo.ts`): toda a matemática de datas, sem dependências.
- **Service** (`ContagemRegressivaService`): orquestra o fluxo reativo.
- **Injeção de dependência / Strategy**: tokens `RELOGIO` (fonte do "agora") e `DATA_ALVO`, que os
  testes substituem por valores fixos.
- **Componente de apresentação** com `OnPush` + signals (`computed`) e sem lógica de negócio.

### 8. Testes quebrados

O spec gerado pelo CLI esperava `'processo-seletivo app is running!'`, texto que não existia no
template, então a suíte falhava desde o primeiro commit. O spec do componente só verificava
`toBeTruthy()`.

**Correção:** 29 testes unitários (Karma + Jasmine) com **100% de cobertura** e limite mínimo de
90% que quebra o CI; 12 testes E2E (Playwright, desktop + mobile) com relógio controlado.

### 9. Stack sem suporte

Angular 10 está sem suporte desde 2022; TSLint foi descontinuado em 2019 e o Protractor em 2023.
O `npm audit` do lockfile original apontava **205 vulnerabilidades (21 críticas, 97 altas)**.

**Correção:** Angular 22 (standalone, zoneless, signals, novo control flow, builder esbuild),
TypeScript 6, ESLint (`angular-eslint`) e Playwright. Resultado: **0 vulnerabilidades** no
`npm audit`. O `firebase-tools` (usado só para o emulador local e no CI) roda via `npx` com versão
fixa em vez de entrar no `package-lock.json`, o que também reduziu a árvore de dependências de 1335 para 750 pacotes.

### 10. Hosting sem headers de segurança

**Correção** (`firebase.json`):

| Header                                | Valor / objetivo                                                      |
| ------------------------------------- | --------------------------------------------------------------------- |
| `Content-Security-Policy`             | `default-src 'self'`, sem scripts inline, `frame-ancestors 'none'`, … |
| `Strict-Transport-Security`           | HTTPS obrigatório por 2 anos                                          |
| `X-Content-Type-Options`              | `nosniff`                                                             |
| `X-Frame-Options`                     | `DENY` (anti-clickjacking)                                            |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`                                     |
| `Permissions-Policy`                  | câmera, microfone, geolocalização etc. desabilitados                  |
| `Cross-Origin-Opener/Resource-Policy` | `same-origin`                                                         |

Além disso: **Subresource Integrity** nos bundles, fontes servidas pelo próprio domínio (sem
Google Fonts) e cache imutável para arquivos com hash. Os testes E2E rodam no emulador do
Firebase Hosting, então qualquer violação de CSP aparece como erro no console e quebra o CI.

> `style-src` mantém `'unsafe-inline'` porque o Angular injeta os estilos dos componentes em
> tags `<style>`. Como o site é estático (sem nonce por requisição), é o trade-off padrão; scripts
> continuam restritos a `'self'`.

---

## 🟡 Médios

### 11. Dependências não usadas

`@angular/fire`, `firebase`, `fuzzy`, `inquirer`, `inquirer-autocomplete-prompt`, `open`,
`codelyzer`, `protractor`, `ts-node`… Removidas. O bundle inicial ficou em **~37 kB** (gzip).

### 12. Layout frágil

Posicionamento com `vw` e percentuais calibrados à mão, mais 4 media queries, desalinhava em
várias larguras.

**Correção:** o banner é um _container_ (`container-type: inline-size`) e todas as medidas da
contagem usam `cqi`, ou seja, escalam junto com a imagem em qualquer tela, sem media queries.

### 13. Fonte

O CSS usava `font-weight: 900`, mas o Google Fonts carregava apenas 400 e 700, então o navegador
gerava um negrito sintético. **Correção:** `@fontsource/roboto` (subset latin, 900 normal e
itálico) servido localmente.

### 14. Acessibilidade

- `alt="cd"` → texto alternativo descritivo.
- Sem `h1` → `h1` visualmente oculto.
- Números soltos sem contexto → `role="timer"` com `aria-label` ("Faltam 26 dias, 11 horas…"),
  dígitos com `aria-hidden`.
- Regras `templateAccessibility` do `angular-eslint` ativas.

### 15. Core Web Vitals

`width`/`height` explícitos na imagem (sem _layout shift_), `fetchpriority="high"` e
`<link rel="preload">` para a imagem LCP.

### 16. Cache do Firebase versionado

`.firebase/hosting.*.cache` estava no Git. Removido e adicionado ao `.gitignore`.

---

## 🔵 Baixos

- **17.** `AppRoutingModule` sem rotas: removido (app standalone sem router).
- **18.** `DataLimite` (PascalCase em propriedade) e `x` (nome sem significado) → nomes
  descritivos em camelCase.
- **19.** Adicionados Prettier, ESLint, Husky + lint-staged (pre-commit), commitlint
  (Conventional Commits), Dependabot e pipeline de CI/CD no GitHub Actions.
