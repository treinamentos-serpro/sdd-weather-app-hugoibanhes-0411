# Backlog de Tarefas — Weather App

Tarefas derivadas do [plano técnico](../plans/weather-app-plan.md) e rastreadas à [especificação](../specs/weather-app-spec.md). Cada tarefa é uma unidade de responsabilidade única; os critérios indicam a cobertura verificável da spec. Lint, build, testes unitários e E2E já são gates da CI e não são duplicados neste backlog.

## Rastreabilidade dos requisitos funcionais

| Requisito | Tarefas de implementação | Tarefas de teste | Cobertura |
| --- | --- | --- | --- |
| RF1 — Buscar cidade | T-05, T-07, T-09, T-18 | T-25, T-29, T-37 | Coberto. |
| RF2 — Desambiguar resultados | T-05, T-10, T-18 | T-25, T-30, T-37 | Coberto. |
| RF3 — Consultar clima atual | T-06, T-08, T-14, T-19, T-22 | T-25, T-31, T-38 | Coberto. |
| RF4 — Consultar previsão de cinco dias | T-03, T-06, T-08, T-15, T-16, T-20, T-23 | T-25, T-27, T-32, T-33, T-38 | Coberto. |
| RF5 — Alternar unidade | T-02, T-17, T-21, T-22, T-23 | T-26, T-35, T-36, T-38 | Coberto. |
| RF6 — Unidade inicial | T-21 | T-36, T-38 | Coberto. |
| RF7 — Estados da consulta | T-07, T-08, T-09, T-11, T-12, T-13, T-14, T-16, T-18, T-19, T-20 | T-29, T-31, T-33, T-34, T-39 | Coberto. |
| RF8 — Recuperar de falhas | T-05, T-06, T-07, T-08, T-13, T-19, T-20, T-21 | T-25, T-34, T-39 | Coberto. |
| RF9 — Localização selecionada | T-08, T-10, T-18, T-19, T-20 | T-30, T-34, T-37, T-38 | Coberto. |
| RF10 — Idioma pt-BR e datas | T-03, T-04, T-09, T-11, T-13, T-14, T-15, T-16, T-18, T-19, T-20 | T-27, T-28, T-43 | Coberto por testes de datas/dias, rótulos WMO e textos visíveis nos estados da interface (AC-RF10-01/02). |

RF1–RF10 têm tarefas de implementação e teste associadas.

## Prioridade, tamanho e fatias de entrega

Prioridade indica ordem de investimento, não permissão para omitir requisitos: **P0** é o primeiro incremento utilizável e bloqueia a demonstração funcional; **P1** completa a aceitação da v1 e sua qualidade; **P2** reúne validações e evidências obrigatórias antes do release de produção. Tamanho é relativo ao backlog: **P** é uma mudança/teste direto; **M** envolve vários comportamentos em uma responsabilidade; **G** tem alta complexidade de integração, cenários ou validação, mesmo mantendo escopo isolado.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P1 | P |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | M |
| T-06 | P0 | G |
| T-07 | P0 | M |
| T-08 | P0 | G |
| T-09 | P0 | P |
| T-10 | P0 | M |
| T-11 | P0 | P |
| T-12 | P0 | P |
| T-13 | P0 | P |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P0 | M |
| T-17 | P1 | P |
| T-18 | P0 | P |
| T-19 | P0 | P |
| T-20 | P0 | P |
| T-21 | P1 | P |
| T-22 | P1 | P |
| T-23 | P1 | P |
| T-24 | P1 | P |
| T-25 | P0 | G |
| T-26 | P1 | P |
| T-27 | P0 | P |
| T-28 | P0 | P |
| T-29 | P0 | M |
| T-30 | P0 | M |
| T-31 | P0 | M |
| T-32 | P0 | M |
| T-33 | P0 | M |
| T-34 | P0 | G |
| T-35 | P1 | P |
| T-36 | P1 | M |
| T-37 | P0 | M |
| T-38 | P0 | G |
| T-39 | P0 | G |
| T-40 | P1 | M |
| T-41 | P1 | G |
| T-42 | P1 | G |
| T-43 | P1 | M |
| T-44 | P1 | M |
| T-45 | P1 | M |
| T-46 | P2 | G |
| T-47 | P2 | M |

### Sequência sugerida de fatias verticais

| Fatia | Entrega visível | Tarefas na sequência |
| --- | --- | --- |
| 1 — Buscar e escolher cidade | Busca utilizável, opções com contexto geográfico, seleção explícita e estados inicial/vazio/erro. | T-01 → T-05 → T-07 → T-09–T-13 → T-18 → T-27, T-28, T-37 |
| 2 — Mostrar clima atual | Cidade selecionada com condições atuais, rótulos WMO e fallback para métricas ausentes. | T-04, T-06, T-08, T-14 → T-19 → T-25, T-31, T-34 |
| 3 — Mostrar previsão | Cinco dias locais, campos ausentes e recuperação independente da seção. | T-03, T-15, T-16 → T-20 → T-32, T-33, T-39 |
| 4 — Completar experiência v1 | Unidade C/F persistida, erros parciais, idioma, crédito e E2E integrado. | T-02, T-17, T-21–T-24 → T-26, T-28, T-35, T-36, T-38, T-41, T-43 |
| 5 — Preparar produção | Responsividade, contraste, performance e validações de release. | T-40, T-42, T-44–T-47 |

T-18, T-19 e T-20 dividem a composição de `App.tsx` em shell/busca, clima atual e forecast. Essa sequência permite demonstrar busca e seleção antes de integrar as duas seções meteorológicas. Tarefas P1/P2 continuam obrigatórias para declarar a v1 aceita e liberar produção, respectivamente.

## Entrega 1 — Tipos e contratos

### T-01 — Definir contratos meteorológicos normalizados
- **Descrição curta:** Definir os tipos compartilhados para cidade, clima atual, previsão, unidade e estados independentes.
- **Critérios de aceite:**
  - Os tipos exportam os contratos e campos definidos no plano para `City`, `CurrentWeather`, `ForecastDay`, `WeatherSection`, `SectionStatus`, `WeatherData` e `Unit`; temperaturas meteorológicas são armazenadas em Celsius e métricas ausentes são `null`. (AC-RF3-02, AC-RF4-03; contrato técnico do plano)
  - `ForecastDay` preserva `date`, marca como indisponível um dia sem métricas e mantém zero como valor disponível. (AC-RF4-03)
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data

## Entrega 2 — Funções puras

### T-02 — Implementar conversão de temperatura
- **Descrição curta:** Implementar conversão Celsius/Fahrenheit e símbolo da unidade.
- **Critérios de aceite:**
  - Converter 20 °C retorna 68 °F e converter 68 °F retorna 20 °C; os demais resultados são arredondados ao inteiro mais próximo e cada unidade retorna o símbolo correspondente. (AC-RF5-01, AC-RF5-02, AC-RF5-04)
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data

### T-03 — Implementar formatação de datas
- **Descrição curta:** Formatar data e dia da semana em pt-BR considerando o fuso recebido.
- **Critérios de aceite:**
  - Para uma data local ISO, a saída contém dia e nome do dia em português no formato `DD/MM/AAAA` e conserva a data de calendário mesmo se a conversão para o fuso do dispositivo pudesse deslocá-la. (AC-RF4-05, AC-RF10-02)
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/format.ts`
- **Tipo:** Data

### T-04 — Implementar rótulos de códigos meteorológicos
- **Descrição curta:** Mapear códigos WMO para rótulos pt-BR com fallback compreensível.
- **Critérios de aceite:**
  - Cada código WMO suportado retorna rótulo em pt-BR; um código não mapeado retorna texto de fallback não vazio e compreensível, sem apresentar o código como descrição meteorológica. (AC-RF10-01)
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`
- **Tipo:** Data

## Entrega 3 — Services

### T-05 — Implementar busca geográfica Open-Meteo
- **Descrição curta:** Consultar Geocoding API e normalizar resultados para `City`.
- **Critérios de aceite:**
  - Uma busca com nome não vazio envia o nome completo codificado com `count=5`, `language=pt` e `format=json`; resultados preservam cidade e contexto geográfico disponível, normalizando país/região ausentes para `null`. (AC-RF1-01, AC-RF1-03, AC-RF2-01; origem sem chave conforme RNF5)
  - Resposta bem-sucedida sem resultados retorna lista vazia; HTTP não-2xx, rejeição de rede e JSON inválido retornam falha, e solicitação sem resposta é cancelada em 10 segundos. (AC-RF7-03, AC-RF7-05, AC-RF8-01, AC-RF8-02)
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

### T-06 — Implementar consulta e normalização do clima e previsão
- **Descrição curta:** Consultar blocos current e daily, validando e normalizando cada seção independentemente.
- **Critérios de aceite:**
  - A URL usa latitude/longitude da cidade selecionada, `timezone=auto`, `forecast_days=5`, Celsius, km/h e mm; os campos de clima atual e diário correspondem aos definidos no plano. (AC-RF3-01, AC-RF3-03, AC-RF4-01, AC-RF4-02, AC-RF9-01; endpoint sem chave conforme RNF5)
  - Cada métrica ausente é normalizada para `null` e cada valor zero permanece `0` na seção correspondente. (AC-RF3-02, AC-RF4-03)
  - Uma resposta diária válida produz exatamente cinco datas locais em ordem cronológica; quantidade diferente de cinco ou arrays de comprimentos incompatíveis marca somente a previsão como erro, sem descartar clima atual válido. (AC-RF4-01, AC-RF4-04, AC-RF4-05, AC-RF8-04)
  - Falha de transporte, HTTP ou leitura do JSON marca como erro todas as seções pedidas; bloco ausente/inválido marca erro somente na seção correspondente, e a operação de retry aceita solicitar apenas `current` ou `daily`. (AC-RF8-01, AC-RF8-02, AC-RF8-04, AC-RF8-05)
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data

## Entrega 4 — Hooks e orquestração

### T-07 — Implementar ciclo de vida da busca no hook
- **Descrição curta:** Gerenciar validação, estados, retry e concorrência da busca geográfica.
- **Critérios de aceite:**
  - Enviar entrada vazia ou só com espaços não chama o serviço; uma busca válida transita para loading e termina em resultados, lista vazia ou erro conforme a resposta. (AC-RF1-02, AC-RF7-02, AC-RF7-03, AC-RF7-05)
  - Quando a resposta da busca B chega antes da resposta da busca A, os resultados de B permanecem; acionar retry provoca nova chamada e uma resposta bem-sucedida substitui o erro pelos resultados. (AC-RF1-04, AC-RF8-01, AC-RF8-03)
- **Dependências:** T-05
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

### T-08 — Implementar carregamento independente das seções
- **Descrição curta:** Orquestrar seleção meteorológica, concorrência, estados independentes e retry local.
- **Critérios de aceite:**
  - Selecionar uma cidade envia suas coordenadas e associa `current` e `forecast` ao mesmo objeto de cidade; após selecionar outra, respostas atrasadas da seleção anterior não substituem os dados da nova cidade. (AC-RF9-01, AC-RF9-02)
  - Cada seção transita independentemente entre loading, success e error; falha ou retry de uma seção deixa intactos os dados válidos da outra, e sucesso de retry substitui o erro pela seção carregada. (AC-RF7-02, AC-RF7-04, AC-RF8-03, AC-RF8-04, AC-RF8-05)
  - Acionar retry da previsão com clima atual válido faz uma chamada somente para daily; timeout encerra loading, apresenta mensagem de expiração e mantém disponível o retry da seção. (AC-RF8-01, AC-RF8-02, AC-RF8-05)
- **Dependências:** T-06, T-07
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Tipo:** Data

## Entrega 5 — Componentes de UI

### T-09 — Implementar campo de busca
- **Descrição curta:** Apresentar entrada, envio e estados do controle de busca.
- **Critérios de aceite:**
  - Campo e ação de envio têm nomes acessíveis; envio com valor vazio ou só espaços não chama a busca e mantém o campo editável. (AC-RF1-02, AC-RNF3-02)
  - Sem cidade selecionada, campo e convite para pesquisar são apresentados sem estado vazio/erro; durante uma busca pendente há indicador visível e estado semanticamente identificável, e ao final o campo pode ser usado novamente. (AC-RF7-01, AC-RF7-02, AC-RNF3-02)
- **Dependências:** T-07
- **Arquivos prováveis:** `src/components/SearchBar.tsx`
- **Tipo:** UI

### T-10 — Implementar opções de cidades selecionáveis
- **Descrição curta:** Apresentar resultados geográficos e aguardar seleção explícita da pessoa.
- **Critérios de aceite:**
  - Cada opção selecionável mostra o nome e, quando retornados, região/estado e país; após resultados carregarem, nenhuma opção é selecionada até a pessoa ativar uma delas. (AC-RF1-01, AC-RF2-01, AC-RF2-02, AC-RF9-01)
  - Tab alcança cada opção, Enter ou Espaço seleciona a opção focada e o indicador de foco permanece visível; cada opção tem nome acessível. (AC-RNF3-01, AC-RNF3-02)
- **Dependências:** T-07
- **Arquivos prováveis:** `src/components/CityResults.tsx` (criar somente se necessário para a seleção explícita)
- **Tipo:** UI

### T-11 — Implementar estado vazio
- **Descrição curta:** Apresentar ausência de resultados sem confundi-la com erro.
- **Critérios de aceite:**
  - Após busca bem-sucedida com lista vazia, a região `role="status"` apresenta mensagem em pt-BR informando que não foram encontradas cidades e permite editar/enviar nova busca; não é renderizada no estado inicial nem após falha. (AC-RF7-01, AC-RF7-03, AC-RF7-05, AC-RF10-01)
- **Dependências:** T-07
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`
- **Tipo:** UI

### T-12 — Implementar estado de carregamento
- **Descrição curta:** Apresentar feedback visual e semântico de operações pendentes.
- **Critérios de aceite:**
  - Enquanto busca ou seção meteorológica está pendente, a região correspondente apresenta indicador visível com `role="status"` e texto “Carregando”; após sucesso, o indicador deixa de ser renderizado. (AC-RF7-02, AC-RF7-04, AC-RNF3-02)
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`
- **Tipo:** UI

### T-13 — Implementar estado de erro reutilizável
- **Descrição curta:** Apresentar falha em pt-BR e ação de retry fornecida pela seção.
- **Critérios de aceite:**
  - Em uma falha, `role="alert"` apresenta mensagem em pt-BR informando que não foi possível carregar; para timeout informa expiração. O botão nomeado “Tentar novamente” aciona a operação/seção associada e o estado vazio não é renderizado. (AC-RF7-05, AC-RF8-01, AC-RF8-02, AC-RNF3-02)
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`
- **Tipo:** UI

### T-14 — Implementar apresentação do clima atual
- **Descrição curta:** Renderizar condição, temperaturas e métricas atuais com fallback explícito.
- **Critérios de aceite:**
  - Com todos os campos preenchidos, a seção renderiza temperatura, condição, umidade com `%`, vento com `km/h`, pressão com `hPa` e precipitação com `mm`; a temperatura segue a unidade ativa. (AC-RF3-01, AC-RF3-03, AC-RF5-01, AC-RF5-02)
  - Para cada campo `null`, renderiza “Não disponível”; para um campo com valor zero, renderiza `0` e sua unidade, sem substituí-lo pelo fallback. (AC-RF3-02)
  - Durante loading, mostra indicador; em sucesso mostra o conteúdo e encerra o indicador; em erro mostra mensagem e ação de retry da seção, mantendo previsão válida visível. (AC-RF7-02, AC-RF7-04, AC-RF7-05, AC-RF8-04, AC-RF8-05)
- **Dependências:** T-01, T-02, T-04, T-08, T-12, T-13
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Tipo:** UI

### T-15 — Implementar cartão de previsão diária
- **Descrição curta:** Renderizar uma data e suas métricas, incluindo o fallback para dia sem dados.
- **Critérios de aceite:**
  - Para cada métrica disponível, renderiza mínima, máxima, condição, precipitação em mm e vento em km/h; cada campo ausente mostra “Não disponível” e temperaturas usam a unidade recebida para apresentação. (AC-RF4-02, AC-RF4-03, AC-RF5-01, AC-RF5-02)
  - Quando `available` é falso, mantém a data e mostra “Previsão indisponível” no lugar das métricas do dia. (AC-RF4-03)
- **Dependências:** T-01, T-02, T-03, T-04, T-12, T-13
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`
- **Tipo:** UI

### T-16 — Implementar lista de cinco dias
- **Descrição curta:** Organizar os cartões da cidade selecionada na ordem local da previsão.
- **Critérios de aceite:**
  - Com cinco datas locais fornecidas, renderiza exatamente cinco cartões em ordem cronológica, do dia local atual aos quatro seguintes, mantendo cada métrica no cartão da data correspondente. (AC-RF4-01, AC-RF4-04, AC-RF4-05)
  - Loading da previsão exibe indicador sem ocultar clima atual válido; falha da previsão exibe erro e retry somente nessa seção, e sucesso encerra loading e mostra cartões. (AC-RF7-02, AC-RF7-04, AC-RF7-05, AC-RF8-04, AC-RF8-05)
- **Dependências:** T-08, T-12, T-13, T-15
- **Arquivos prováveis:** `src/components/ForecastList.tsx`
- **Tipo:** UI

### T-17 — Implementar controle visual de unidade
- **Descrição curta:** Apresentar seleção acessível entre Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Celsius e Fahrenheit são controles selecionáveis por teclado; ativar cada opção atualiza a unidade ativa identificada no controle e seu nome/estado é exposto semanticamente. (AC-RF5-03, AC-RNF3-01, AC-RNF3-02)
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`
- **Tipo:** UI

## Entrega 6 — Integração da aplicação

### T-18 — Compor shell de busca e seleção
- **Descrição curta:** Integrar a busca, resultados selecionáveis e estados iniciais na tela principal.
- **Critérios de aceite:**
  - Na abertura, o shell mostra convite para buscar e não mostra conteúdo meteorológico nem estado vazio de resultados. (AC-RF7-01)
  - Busca válida mostra opções geográficas; selecionar uma opção encaminha exatamente essa cidade ao hook, sem seleção automática e sem `fetch` em componentes. (AC-RF1-01, AC-RF2-01, AC-RF2-02, AC-RF9-01; fronteira de camadas do plano)
  - Estados de busca pendente, vazio e erro são apresentados sem se sobrepor e com mensagens em pt-BR. (AC-RF7-02, AC-RF7-03, AC-RF7-05, AC-RF10-01)
- **Dependências:** T-08, T-09, T-10, T-11, T-12, T-13
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

### T-19 — Compor seção de clima atual
- **Descrição curta:** Conectar o estado de clima atual à tela, independente do carregamento da previsão.
- **Critérios de aceite:**
  - A seção atual só é renderizada com dados da cidade selecionada; enquanto carrega apresenta loading e, em falha, erro/retry da seção. (AC-RF3-01, AC-RF7-02, AC-RF7-04, AC-RF7-05, AC-RF8-04)
  - Falha ou loading do forecast não oculta dados atuais válidos; componentes de apresentação não executam `fetch`. (AC-RF8-04; fronteira de camadas do plano)
- **Dependências:** T-08, T-12, T-13, T-14, T-18
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

### T-20 — Compor seção de previsão
- **Descrição curta:** Conectar forecast à tela sem condicionar sua exibição ao sucesso do clima atual.
- **Critérios de aceite:**
  - A seção de previsão renderiza os cinco dias da cidade selecionada em `success`; loading e erro/retry afetam apenas forecast. (AC-RF4-01, AC-RF7-02, AC-RF7-04, AC-RF7-05, AC-RF8-04)
  - Falha ou loading do clima atual não oculta previsão válida, e as duas seções permanecem associadas à mesma cidade. (AC-RF8-04, AC-RF9-01; fronteira de camadas do plano)
- **Dependências:** T-08, T-12, T-13, T-16, T-19
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

### T-21 — Persistir preferência de unidade
- **Descrição curta:** Inicializar e salvar somente a unidade no armazenamento local com fallback resiliente.
- **Critérios de aceite:**
  - Selecionar Fahrenheit grava a preferência e, após recarregar, inicia em Fahrenheit; ausência de chave ou valor inválido inicia em Celsius. (AC-RF5-05, AC-RF6-01)
  - Se leitura ou escrita do armazenamento lançar erro, a aplicação continua permitindo busca/consulta e usa Celsius durante a sessão; nenhuma chave/valor de cidade é gravada. (AC-RF6-01; fallback de armazenamento conforme contrato técnico do plano)
- **Dependências:** T-17, T-20
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

### T-22 — Aplicar unidade ao clima atual
- **Descrição curta:** Passar a unidade ativa ao componente de clima atual sem nova consulta meteorológica.
- **Critérios de aceite:**
  - Com clima atual carregado, alternar C→F→C atualiza o número e símbolo exibidos conforme a conversão/arredondamento, mantém a mesma cidade e produz zero novas chamadas ao serviço meteorológico. (AC-RF5-01, AC-RF5-02, AC-RF5-03, AC-RF5-04)
- **Dependências:** T-02, T-19, T-21
- **Arquivos prováveis:** `src/App.tsx`, `src/components/CurrentWeather.tsx`
- **Tipo:** UI

### T-23 — Aplicar unidade à previsão
- **Descrição curta:** Passar a unidade ativa aos cartões de previsão sem nova consulta meteorológica.
- **Critérios de aceite:**
  - Com cinco dias carregados, alternar C→F→C atualiza mínima e máxima em todos os cartões com valores arredondados e símbolos correspondentes, mantém a mesma cidade e produz zero novas chamadas ao serviço meteorológico. (AC-RF5-01, AC-RF5-02, AC-RF5-03, AC-RF5-04)
- **Dependências:** T-02, T-20, T-22
- **Arquivos prováveis:** `src/App.tsx`, `src/components/ForecastCard.tsx`
- **Tipo:** UI

### T-24 — Exibir crédito Open-Meteo
- **Descrição curta:** Apresentar atribuição visível com link para a fonte dos dados meteorológicos.
- **Critérios de aceite:**
  - Com dados meteorológicos renderizados, há crédito visível “Open-Meteo” em elemento de link cujo destino é o endereço oficial da fonte. (AC-RNF5-01)
- **Dependências:** T-23
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI

## Entrega 7 — Testes

### T-25 — Testar serviço Open-Meteo
- **Descrição curta:** Cobrir busca, previsão, normalização e falhas com `fetch` simulado.
- **Critérios de aceite:**
  - Com `fetch` simulado, as asserções esperam URL/parâmetros corretos, nome com acento/hífen/apóstrofo codificado e resultados geográficos normalizados; resposta sem resultados produz lista vazia. (AC-RF1-03, AC-RF2-01, AC-RF7-03; origem sem chave conforme RNF5)
  - Para payloads de clima, as asserções esperam que `null` permaneça ausente, zero permaneça disponível, cinco datas locais sejam mantidas e payload parcial/arrays inconsistentes afetem apenas a seção prevista. (AC-RF3-02, AC-RF4-01, AC-RF4-03, AC-RF4-05, AC-RF8-04)
  - Respostas HTTP inválidas, rejeição de rede e JSON inválido resultam em falha; relógio/fake timers comprovam timeout em 10 segundos e o retry envia somente o parâmetro da seção solicitada, sem chamadas à rede pública. (AC-RF8-01, AC-RF8-02, AC-RF8-05)
- **Dependências:** T-05, T-06
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test

### T-26 — Testar conversão de temperatura
- **Descrição curta:** Verificar valores, arredondamento e símbolos da conversão sem mocks.
- **Critérios de aceite:**
  - As asserções esperam 20 °C → 68 °F e 68 °F → 20 °C, verificam arredondamento ao inteiro mais próximo e os símbolos °C/°F para cada unidade. (AC-RF5-01, AC-RF5-02, AC-RF5-04)
- **Dependências:** T-02
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Tipo:** Test

### T-27 — Testar formatação de datas
- **Descrição curta:** Verificar formato e dia da semana em pt-BR, incluindo diferenças de fuso.
- **Critérios de aceite:**
  - Para datas fixas, as asserções esperam saída `DD/MM/AAAA`, nome do dia em português e a mesma data local de entrada mesmo quando o fuso do dispositivo difere do da cidade. (AC-RF4-05, AC-RF10-02)
- **Dependências:** T-03
- **Arquivos prováveis:** `tests/unit/format.test.ts`
- **Tipo:** Test

### T-28 — Testar rótulos de códigos meteorológicos
- **Descrição curta:** Verificar códigos WMO conhecidos e desconhecidos sem mocks.
- **Critérios de aceite:**
  - Para um código WMO conhecido a função retorna rótulo em pt-BR; para um código desconhecido retorna fallback não vazio, sem expor o identificador técnico como rótulo. (AC-RF10-01)
- **Dependências:** T-04
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`
- **Tipo:** Test

### T-29 — Testar busca e entrada
- **Descrição curta:** Testar interação, validação e estados visíveis do campo de busca.
- **Critérios de aceite:**
  - Em teste de interação, enviar valor vazio ou só espaços mantém o campo editável e resulta em zero chamadas ao callback; o campo e botão têm nomes acessíveis. (AC-RF1-02, AC-RNF3-02)
  - Com callback de busca pendente, enviar uma busca apresenta indicador visível e status semântico de loading; antes de qualquer cidade ser selecionada, a tela de busca não apresenta erro nem estado “nenhum resultado”. (AC-RF7-01, AC-RF7-02, AC-RNF3-02)
- **Dependências:** T-09
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`
- **Tipo:** Test

### T-30 — Testar seleção e desambiguação de cidades
- **Descrição curta:** Testar opções geográficas, seleção explícita e navegação acessível.
- **Critérios de aceite:**
  - Renderizando duas cidades homônimas com regiões distintas, ambas exibem seu contexto disponível; antes de interação o callback não é chamado, e ativar a segunda opção por teclado chama o callback uma vez com somente a cidade escolhida. (AC-RF1-01, AC-RF2-01, AC-RF2-02, AC-RNF3-01, AC-RNF3-02)
- **Dependências:** T-10
- **Arquivos prováveis:** `tests/unit/CityResults.test.tsx`
- **Tipo:** Test

### T-31 — Testar apresentação do clima atual
- **Descrição curta:** Verificar métricas, unidades e dados ausentes na seção atual.
- **Critérios de aceite:**
  - Para fixture completa, as asserções encontram temperatura, condição, umidade `%`, vento `km/h`, pressão `hPa` e precipitação `mm`; com cada campo meteorológico individualmente `null`, o campo correspondente mostra “Não disponível”, e com zero mostra `0` com unidade. (AC-RF3-01, AC-RF3-02, AC-RF3-03)
- **Dependências:** T-14
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`
- **Tipo:** Test

### T-32 — Testar cartão de previsão diária
- **Descrição curta:** Verificar campos, data e fallback de métricas por dia.
- **Critérios de aceite:**
  - Para fixture diária completa, as asserções encontram mínima, máxima, condição, precipitação em mm e vento em km/h; ao definir cada campo individualmente como `null`, o campo correspondente mostra “Não disponível”. (AC-RF4-02, AC-RF4-03)
  - Para fixture sem métricas (`available: false`), as asserções encontram a data original e “Previsão indisponível”. (AC-RF4-03)
- **Dependências:** T-15
- **Arquivos prováveis:** `tests/unit/ForecastCard.test.tsx`
- **Tipo:** Test

### T-33 — Testar lista de cinco dias
- **Descrição curta:** Verificar quantidade, cronologia, fuso e estados da previsão.
- **Critérios de aceite:**
  - Com dados de cinco dias e fuso de fixture diferente do fuso do ambiente, as asserções encontram exatamente cinco datas locais em ordem e cada temperatura no cartão cuja data corresponde ao índice recebido. (AC-RF4-01, AC-RF4-04, AC-RF4-05)
  - Fixtures de loading, sucesso e erro verificam respectivamente indicador, cartões sem indicador e mensagem/retry; em erro, o clima atual válido continua renderizado e o retry chama somente o callback da previsão. (AC-RF7-02, AC-RF7-04, AC-RF7-05, AC-RF8-04, AC-RF8-05)
- **Dependências:** T-16
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`
- **Tipo:** Test

### T-34 — Testar orquestração meteorológica
- **Descrição curta:** Testar estados, concorrência, associação de cidade, falha parcial e retry no hook.
- **Critérios de aceite:**
  - Com duas seleções e promessas controladas resolvidas fora de ordem, as asserções esperam que os dados finais de ambas as seções pertençam à última cidade selecionada e que as coordenadas enviadas sejam as dessa cidade. (AC-RF9-01, AC-RF9-02)
  - Para respostas pendentes, bem-sucedidas e parciais, as asserções esperam estados loading/success/error independentes; após falha do forecast, current permanece inalterado e retry chama somente forecast, cuja resposta bem-sucedida remove seu erro. (AC-RF7-02, AC-RF7-04, AC-RF7-05, AC-RF8-03, AC-RF8-04, AC-RF8-05)
- **Dependências:** T-08
- **Arquivos prováveis:** `tests/unit/useWeather.test.tsx`
- **Tipo:** Test

### T-35 — Testar controle de unidade
- **Descrição curta:** Verificar seleção e indicação acessível da unidade ativa.
- **Critérios de aceite:**
  - Ativar Celsius e Fahrenheit em testes chama o callback com o valor correspondente; após cada ativação, a opção selecionada é identificada por estado acessível e pode ser alcançada por teclado. (AC-RF5-03, AC-RNF3-01, AC-RNF3-02)
- **Dependências:** T-17
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`
- **Tipo:** Test

### T-36 — Testar composição e preferência de unidade
- **Descrição curta:** Verificar integração observável da tela e persistência local da unidade.
- **Critérios de aceite:**
  - A suíte seleciona uma cidade e verifica que current/forecast exibem dados dela; alternar unidade atualiza todas as temperaturas e, após recarga, restaura a preferência salva ou usa Celsius sem preferência. (AC-RF5-01, AC-RF5-02, AC-RF5-03, AC-RF5-05, AC-RF6-01, AC-RF9-01, AC-RF9-02)
  - Após recarga, não existe cidade em armazenamento local; com leitura e escrita simuladas para lançar erro, a tela permite concluir busca e consulta usando Celsius. (AC-RF6-01; fallback de armazenamento conforme contrato técnico do plano)
- **Dependências:** T-21, T-22, T-23
- **Arquivos prováveis:** `tests/unit/App.test.tsx`
- **Tipo:** Test

### T-37 — Testar E2E de busca e seleção
- **Descrição curta:** Exercitar busca geográfica e escolha explícita entre resultados com respostas interceptadas.
- **Critérios de aceite:**
  - Com respostas interceptadas, buscar nome contendo acento, hífen ou apóstrofo exibe opções correspondentes; para duas cidades homônimas, cada opção mostra contexto disponível, nenhuma é selecionada antes da ação e clicar na segunda faz o fluxo carregar essa cidade. (AC-RF1-01, AC-RF1-03, AC-RF2-01, AC-RF2-02)
- **Dependências:** T-18, T-30
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-38 — Testar E2E de sucesso e unidades
- **Descrição curta:** Exercitar clima atual, cinco dias locais e persistência da unidade em navegador.
- **Critérios de aceite:**
  - Com fixtures interceptadas, as asserções encontram os campos atuais da cidade selecionada e cinco datas locais em ordem com valores nas datas correspondentes; selecionar outra cidade atualiza ambas as seções para ela. (AC-RF3-01, AC-RF4-01, AC-RF4-04, AC-RF4-05, AC-RF9-01, AC-RF9-02)
  - Alternar C/F atualiza todas as temperaturas sem nova chamada meteorológica, após recarga a unidade escolhida permanece ativa, e o crédito Open-Meteo com link oficial está visível. (AC-RF5-01, AC-RF5-02, AC-RF5-03, AC-RF5-05, AC-RF6-01, AC-RNF5-01)
- **Dependências:** T-18, T-21, T-22, T-23, T-24, T-36
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-39 — Testar E2E de erros, resposta parcial e retry
- **Descrição curta:** Exercitar vazio, erro, timeout, falha parcial e recuperação com API interceptada.
- **Critérios de aceite:**
  - Resposta de busca vazia mostra mensagem de nenhum resultado, resposta de erro mostra mensagem de falha distinta; uma requisição mantida sem resposta até 10 segundos mostra expiração, e retry com resposta bem-sucedida substitui erro por conteúdo. (AC-RF7-03, AC-RF7-05, AC-RF8-01, AC-RF8-02, AC-RF8-03)
  - Em resposta parcial com uma seção bem-sucedida e outra falha, os dados da primeira permanecem visíveis; somente a segunda mostra retry e acioná-lo não repete a primeira. (AC-RF7-02, AC-RF7-04, AC-RF8-04, AC-RF8-05)
- **Dependências:** T-13, T-14, T-16, T-18, T-21, T-22, T-23, T-24, T-34
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-40 — Testar E2E mobile
- **Descrição curta:** Verificar os fluxos essenciais em viewports móveis estreitos.
- **Critérios de aceite:**
  - Em viewports de 320 px e 375 px, o teste completa busca, seleção, leitura das cinco datas e retry; em cada viewport `scrollWidth` não excede `clientWidth` e busca, dados e controles não estão cortados nem sobrepostos. (AC-RNF2-01)
- **Dependências:** T-37, T-39
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-41 — Testar E2E de acessibilidade
- **Descrição curta:** Verificar teclado, foco, semântica e contraste nos fluxos principais.
- **Critérios de aceite:**
  - Nos fluxos de busca, seleção, retry e unidade, Tab/Shift+Tab alcançam cada controle funcional, o foco tem indicador visível, e a árvore acessível expõe nome para cada controle e estado semântico para loading/erro. (AC-RNF3-01, AC-RNF3-02)
  - A auditoria mede todas as combinações de texto/fundo verificadas e não reporta razão inferior a 4,5:1 para texto comum nem a 3:1 para texto grande. (AC-RNF3-03)
- **Dependências:** T-37, T-38, T-39, T-40
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

### T-42 — Medir performance e RNF1
- **Descrição curta:** Automatizar a medição de inicialização e feedback de busca sob condições reproduzíveis no CI.
- **Critérios de aceite:**
  - Em três navegações limpas no GitHub Actions, Chromium, viewport 1280 × 720, cache desabilitado, 10 Mbps e 50 ms de latência, mediana até busca visível e habilitada é de até 2 s. (AC-RNF1-01)
  - Com API interceptada, loading aparece em até 100 ms do envio; duração da API externa não entra na métrica de inicialização. (AC-RNF1-02)
- **Dependências:** T-18, T-37, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`
- **Tipo:** Test

### T-43 — Testar textos visíveis em pt-BR
- **Descrição curta:** Verificar o idioma dos rótulos, estados, mensagens e conteúdo meteorológico exibidos.
- **Critérios de aceite:**
  - Com busca vazia inicial, carregamento, busca sem resultados, falha/retry e consulta bem-sucedida simulados, as asserções encontram os rótulos, ações e mensagens esperados em pt-BR, incluindo “Buscar cidade”, “Buscar”, “Carregando”, “Tentar novamente” e a mensagem de cidade não encontrada. (AC-RF7-01, AC-RF7-02, AC-RF7-03, AC-RF7-05, AC-RF8-01, AC-RF10-01)
  - Com uma previsão de datas fixas, os nomes dos dias são exibidos em português e as datas usam `DD/MM/AAAA`; com códigos WMO simulados, as condições têm rótulos pt-BR. (AC-RF10-01, AC-RF10-02)
- **Dependências:** T-18, T-27, T-28, T-37, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Tipo:** Test

## Entrega 8 — Hardening e release

### T-44 — Garantir layout responsivo da tela
- **Descrição curta:** Ajustar a composição para viewports móveis e desktop sem perda de conteúdo essencial.
- **Critérios de aceite:**
  - Em larguras de 320 px, 375 px, 1280 px e 1920 px, busca, clima atual e previsão permanecem visíveis/acessíveis, `scrollWidth` não excede `clientWidth` e nenhum conteúdo essencial está cortado ou sobreposto. (AC-RNF2-01)
- **Dependências:** T-18, T-40
- **Arquivos prováveis:** `src/App.tsx`, `src/styles/index.css`
- **Tipo:** UI

### T-45 — Atender contraste mínimo de texto
- **Descrição curta:** Ajustar cores de texto e fundo aos limites de contraste WCAG 2.2 AA.
- **Critérios de aceite:**
  - A medição de cada combinação de cor de texto/fundo usada na interface resulta em contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande. (AC-RNF3-03)
- **Dependências:** T-18, T-41
- **Arquivos prováveis:** `src/styles/index.css`
- **Tipo:** UI

### T-46 — Verificar compatibilidade em dispositivos reais
- **Descrição curta:** Validar e registrar o fluxo principal nos navegadores e versões exigidos por RNF7.
- **Critérios de aceite:**
  - Para cada execução, registrar data, navegador e versão exata, sistema operacional/dispositivo, versão estável considerada atual/anterior, passos de busca/seleção/consulta e resultado; cobrir Chrome, Edge, Firefox e Safari nas versões estáveis atual e imediatamente anterior, incluindo Safari em dispositivo iOS real e Chrome em dispositivo Android real. Playwright WebKit/Firefox é evidência complementar, não substitui esses registros. (AC-RNF7-01)
  - O relatório/checklist registra aprovação ou falha por combinação navegador/versão/dispositivo; qualquer falha funcional em um alvo deixa o release marcado como bloqueado. (AC-RNF7-01)
- **Dependências:** T-37, T-38, T-39, T-40, T-41, T-42, T-43, T-44, T-45
- **Arquivos prováveis:** Nenhum no repositório; registrar os resultados no relatório/checklist da release.
- **Tipo:** Infra

### T-47 — Verificar termos e limites Open-Meteo para release
- **Descrição curta:** Conferir condições vigentes de uso, limites e atribuição da API antes de cada release de produção.
- **Critérios de aceite:**
  - Para cada release, registrar URL e data de consulta dos termos/documentação oficiais, limites de uso aplicáveis e requisitos de atribuição encontrados; anexar a conclusão de conformidade e confirmar por inspeção que o crédito com link oficial está visível na aplicação. (AC-RNF5-01; verificação pré-release conforme RNF5)
  - O relatório/checklist registra aprovado/reprovado para cada requisito vigente; release fica marcado como bloqueado quando houver requisito não atendido ou evidência ausente. (verificação pré-release conforme RNF5)
- **Dependências:** T-24, T-46
- **Arquivos prováveis:** Nenhum no repositório; registrar a verificação no relatório/checklist da release.
- **Tipo:** Infra
