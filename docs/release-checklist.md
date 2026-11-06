# Checklist de release

O status inicial de cada release é **BLOQUEADO**. Só altere para **APROVADO** quando todas as verificações obrigatórias estiverem concluídas e as evidências registradas. Um resultado pendente, reprovado ou sem evidência mantém o release bloqueado.

## Identificação

- Versão:
- Commit:
- Responsável pela validação:
- Data de início:
- Status: **BLOQUEADO**

## Validações automatizadas

- [ ] `pnpm lint` aprovado; link para log/evidência:
- [ ] `pnpm build` aprovado; link para log/evidência:
- [ ] `pnpm test` aprovado; link para log/evidência:
- [ ] `pnpm test:e2e` aprovado; link para relatório:
- [ ] T-44 responsividade aprovada em 320, 375, 1280 e 1920 px:
- [ ] T-41 contraste aprovado: mínimo 4,5:1 para texto comum e 3:1 para texto grande:

## T-46 Compatibilidade real

Registre a versão exata do navegador, sistema/dispositivo, data, resultado e evidência. Playwright/WebKit/Firefox não substituem as validações em aparelhos reais indicadas abaixo.

| Navegador | Alvo | Versão exata | Sistema/dispositivo | Data | Resultado | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
| Chrome | Estável atual, desktop | Pendente | Pendente | Pendente | Pendente | Pendente |
| Chrome | Estável anterior, desktop | Pendente | Pendente | Pendente | Pendente | Pendente |
| Edge | Estável atual, desktop | Pendente | Pendente | Pendente | Pendente | Pendente |
| Edge | Estável anterior, desktop | Pendente | Pendente | Pendente | Pendente | Pendente |
| Firefox | Estável atual, desktop | Pendente | Pendente | Pendente | Pendente | Pendente |
| Firefox | Estável anterior, desktop | Pendente | Pendente | Pendente | Pendente | Pendente |
| Safari | Estável atual, macOS | Pendente | Pendente | Pendente | Pendente | Pendente |
| Safari | Estável anterior, macOS | Pendente | Pendente | Pendente | Pendente | Pendente |
| Safari | Estável atual, iOS real | Pendente | Modelo iPhone/iPad pendente | Pendente | Pendente | Pendente |
| Safari | Estável anterior, iOS real | Pendente | Modelo iPhone/iPad pendente | Pendente | Pendente | Pendente |
| Chrome | Estável atual, Android real | Pendente | Modelo do aparelho pendente | Pendente | Pendente | Pendente |
| Chrome | Estável anterior, Android real | Pendente | Modelo do aparelho pendente | Pendente | Pendente | Pendente |

Para cada linha, execute busca, seleção explícita, consulta atual e previsão, alternância de unidade e retry após erro. Registre falhas funcionais e abra o bloqueio correspondente; não marque aprovação com evidência incompleta.

## T-47 Termos, limites e atribuição Open-Meteo

Faça esta revisão a cada release. Consulte as fontes oficiais no dia da validação e registre os limites e requisitos vigentes, sem reutilizar valores de uma release anterior sem nova conferência.

| Fonte oficial | URL | Data da consulta | Notas/evidência |
| --- | --- | --- | --- |
| Termos de uso | https://open-meteo.com/en/terms | Pendente | Pendente |
| Documentação Forecast API | https://open-meteo.com/en/docs | Pendente | Pendente |
| Documentação Geocoding API | https://open-meteo.com/en/docs/geocoding-api | Pendente | Pendente |
| Planos e limites de uso | https://open-meteo.com/en/pricing | Pendente | Pendente |

- Limite de requisições e concorrência aplicável a este uso:
- Condições de uso comercial/não comercial aplicáveis:
- Requisitos de atribuição encontrados:
- Compatibilidade da implementação com os requisitos vigentes:
- Evidência da consulta (URL, captura ou relatório arquivado):
- Crédito “Open-Meteo” visível e apontando para `https://open-meteo.com/`: confirmar também no teste E2E T-38.
- Conclusão: PENDENTE

## Decisão

- [ ] **APROVADO**: todas as linhas de T-46 e T-47 têm resultado e evidência; validações automatizadas aprovadas; nenhum bloqueio aberto.
- [ ] **BLOQUEADO**: há item pendente/reprovado, evidência ausente ou falha funcional.
- Responsável pela decisão:
- Data:
- Evidências finais: