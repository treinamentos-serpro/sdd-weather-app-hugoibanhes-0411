# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação web de uso pessoal que permite consultar rapidamente as condições meteorológicas de uma cidade e planejar os próximos dias. A experiência deve funcionar bem em dispositivos móveis e desktop, com interface em pt-BR, dados de clima atual e previsão para cinco dias, e possibilidade de alternar entre Celsius e Fahrenheit.

### Objetivos

- Permitir encontrar uma cidade pelo nome e identificar resultados homônimos.
- Apresentar informações meteorológicas atuais úteis para decisões do dia a dia.
- Apresentar uma previsão diária para hoje e os quatro dias seguintes.
- Permitir alternar a unidade de temperatura sem perder a cidade consultada.
- Comunicar claramente os estados de carregamento, ausência de resultados e falha.

### Personas

- **Viajante planejador:** consulta a previsão de cinco dias para organizar atividades, em desktop ou celular.
- **Decisor do dia a dia:** consulta rapidamente o clima atual, principalmente pelo celular, para decidir como se vestir ou se preparar para chuva.

## Functional Requirements

- **RF1 — Buscar cidade:** o usuário deve poder pesquisar uma cidade pelo nome e receber opções correspondentes para selecionar.
- **RF2 — Desambiguar resultados:** quando houver mais de uma cidade compatível, cada opção deve apresentar contexto geográfico suficiente, como estado/região e país, para ajudar o usuário a escolher.
- **RF3 — Consultar clima atual:** para a cidade selecionada, o produto deve exibir temperatura, condição meteorológica, umidade em porcentagem, velocidade do vento em km/h, pressão em hPa e precipitação em mm, quando os dados estiverem disponíveis.
- **RF4 — Consultar previsão:** o produto deve exibir a previsão para cinco dias, contando hoje e os quatro dias seguintes no fuso horário local da cidade selecionada. Para cada dia, deve apresentar temperaturas mínima e máxima, condição meteorológica, precipitação em mm e velocidade do vento em km/h, quando disponíveis.
- **RF5 — Alternar unidade:** o usuário deve poder alternar entre Celsius e Fahrenheit. A unidade escolhida deve ser aplicada consistentemente às temperaturas do clima atual e da previsão, exibidas arredondadas ao grau inteiro mais próximo, e a preferência deve ser salva no navegador para visitas futuras.
- **RF6 — Unidade inicial:** quando não houver preferência de unidade salva no navegador, as temperaturas devem ser apresentadas em Celsius.
- **RF7 — Informar estados da consulta:** durante a busca e o carregamento do clima, o produto deve indicar que a operação está em andamento. Também deve distinguir ausência de resultados, falhas e conteúdo carregado.
- **RF8 — Recuperar de falhas:** diante de falha de rede ou indisponibilidade dos dados, o produto deve informar que não foi possível concluir a consulta e oferecer uma forma de tentar novamente. Se clima atual ou previsão carregar parcialmente, deve preservar os dados disponíveis e limitar o erro e a nova tentativa à seção que falhou.
- **RF9 — Localização selecionada:** após a seleção de uma cidade, clima atual e previsão devem corresponder à mesma localização.
- **RF10 — Idioma:** textos, mensagens, nomes de dias e datas devem seguir português brasileiro (pt-BR); datas devem usar o formato DD/MM/AAAA.

## User Stories

- **US1 (RF1) — Buscar uma cidade:** Como decisor do dia a dia, quero pesquisar uma cidade pelo nome para consultar o clima do local que me interessa.
- **US2 (RF2) — Desambiguar cidades:** Como viajante planejador, quero distinguir cidades com nomes iguais pelos seus dados geográficos para escolher o destino correto.
- **US3 (RF3) — Consultar o clima atual:** Como decisor do dia a dia, quero ver as condições meteorológicas atuais para decidir como me preparar para o dia.
- **US4 (RF4) — Consultar a previsão:** Como viajante planejador, quero ver a previsão de hoje e dos quatro dias seguintes para organizar meus compromissos.
- **US5 (RF5, RF6) — Consultar temperaturas na unidade desejada:** Como decisor do dia a dia, quero ver as temperaturas inicialmente em Celsius e manter minha unidade preferida entre visitas para interpretá-las com facilidade.
- **US6 (RF7, RF8) — Acompanhar a consulta:** Como decisor do dia a dia, quero entender quando os dados estão carregando, quando não há resultados ou quando ocorreu uma falha para saber como prosseguir e tentar novamente.
- **US7 (RF9) — Consultar a localização selecionada:** Como viajante planejador, quero que o clima atual e a previsão correspondam à cidade que selecionei para planejar atividades no local correto.
- **US8 (RF10) — Usar a interface em português:** Como decisor do dia a dia, quero ler a interface e as mensagens em português brasileiro para entender as informações meteorológicas.

## Acceptance Criteria

### RF1 — Buscar cidade

- **AC-RF1-01:** **Given** que a pessoa informa um nome de cidade não vazio, **When** envia a busca, **Then** o sistema apresenta as cidades correspondentes como opções selecionáveis.
- **AC-RF1-02:** **Given** que a pessoa informa um campo vazio ou composto apenas por espaços, **When** envia a busca, **Then** nenhuma busca é iniciada e a interface mantém o campo disponível para correção.
- **AC-RF1-03:** **Given** que o nome informado contém acentos, hífen ou apóstrofo, **When** a pessoa envia a busca, **Then** o sistema processa o nome completo e apresenta as cidades correspondentes, ou o estado vazio se não houver correspondências.
- **AC-RF1-04:** **Given** que uma busca A foi enviada antes de uma busca B, **When** a resposta de B chega antes da resposta de A, **Then** os resultados de B permanecem apresentados e a resposta tardia de A não os substitui.

### RF2 — Desambiguar resultados

- **AC-RF2-01:** **Given** que a busca retorna mais de uma cidade compatível, **When** as opções são apresentadas, **Then** cada opção inclui o nome da cidade e, quando disponíveis, estado/região e país.
- **AC-RF2-02:** **Given** que há cidades homônimas em regiões diferentes, **When** a pessoa compara as opções, **Then** os dados geográficos apresentados permitem distinguir cada resultado.

### RF3 — Consultar clima atual

- **AC-RF3-01:** **Given** que uma cidade foi selecionada e os dados atuais estão disponíveis, **When** o clima atual é apresentado, **Then** são exibidos temperatura, condição meteorológica, umidade, vento, pressão e precipitação.
- **AC-RF3-02:** **Given** que um desses campos não está disponível nos dados recebidos, **When** o clima atual é apresentado, **Then** o campo mostra “Não disponível”, sem exibir um valor inventado ou tratar ausência como zero.
- **AC-RF3-03:** **Given** que os dados de clima atual estão disponíveis, **When** são apresentados, **Then** umidade usa %, velocidade do vento usa km/h, pressão usa hPa e precipitação usa mm.

### RF4 — Consultar previsão

- **AC-RF4-01:** **Given** que uma cidade foi selecionada e os dados de previsão estão disponíveis, **When** a previsão é apresentada, **Then** são exibidos cinco dias: hoje e os quatro dias seguintes, determinados pelo fuso horário local da cidade selecionada.
- **AC-RF4-02:** **Given** que os dados de um dia estão disponíveis, **When** esse dia é apresentado, **Then** são exibidas as temperaturas mínima e máxima, a condição meteorológica, a precipitação em mm e a velocidade do vento em km/h, quando cada dado estiver disponível.
- **AC-RF4-03:** **Given** que um campo de um dia da previsão não está disponível, **When** esse dia é apresentado, **Then** o campo mostra “Não disponível”; se não houver dados para um dia inteiro, a data permanece na lista com a indicação “Previsão indisponível”.
- **AC-RF4-04:** **Given** que a previsão contém datas e valores diários, **When** é apresentada, **Then** cada valor fica associado à respectiva data, em ordem cronológica.
- **AC-RF4-05:** **Given** que o fuso do dispositivo e o fuso da cidade selecionada estão em datas diferentes, **When** a previsão é apresentada, **Then** o primeiro dia corresponde à data local da cidade selecionada.

### RF5 — Alternar unidade

- **AC-RF5-01:** **Given** que o clima atual e a previsão estão apresentados em Celsius, **When** a pessoa seleciona Fahrenheit, **Then** todas as temperaturas atuais e previstas passam a ser apresentadas em Fahrenheit.
- **AC-RF5-02:** **Given** que o clima atual e a previsão estão apresentados em Fahrenheit, **When** a pessoa seleciona Celsius, **Then** todas as temperaturas atuais e previstas passam a ser apresentadas em Celsius.
- **AC-RF5-03:** **Given** que a pessoa altera a unidade, **When** a interface atualiza as temperaturas, **Then** a cidade selecionada permanece a mesma e a unidade ativa fica identificável.
- **AC-RF5-04:** **Given** uma temperatura de 20 °C, **When** é apresentada em Fahrenheit, **Then** o valor exibido é 68 °F; dado 68 °F, quando é apresentado em Celsius, então o valor exibido é 20 °C.
- **AC-RF5-05:** **Given** que a pessoa seleciona Fahrenheit, **When** recarrega ou reabre a aplicação no mesmo navegador, **Then** as temperaturas continuam em Fahrenheit.

### RF6 — Unidade inicial

- **AC-RF6-01:** **Given** uma primeira utilização, antes de a pessoa alterar qualquer configuração de unidade, **When** temperaturas meteorológicas são apresentadas, **Then** elas são exibidas em Celsius.

### RF7 — Informar estados da consulta

- **AC-RF7-01:** **Given** que nenhuma cidade foi selecionada, **When** a aplicação é aberta, **Then** a busca está disponível com um convite para pesquisar, sem apresentar erro ou mensagem de “nenhum resultado”.
- **AC-RF7-02:** **Given** que uma busca ou carregamento meteorológico foi iniciado e ainda não terminou, **When** a interface aguarda a resposta, **Then** apresenta um estado de carregamento.
- **AC-RF7-03:** **Given** que a busca termina sem cidades correspondentes, **When** o resultado é apresentado, **Then** a interface informa que não encontrou resultados e permite iniciar outra busca.
- **AC-RF7-04:** **Given** que uma consulta termina com sucesso, **When** os dados são apresentados, **Then** a interface deixa de indicar carregamento e apresenta o conteúdo correspondente.
- **AC-RF7-05:** **Given** que uma consulta falha, **When** o resultado é apresentado, **Then** a interface apresenta um estado de erro distinto do estado vazio.

### RF8 — Recuperar de falhas

- **AC-RF8-01:** **Given** que uma falha de rede, indisponibilidade da fonte ou resposta inválida impede a consulta, **When** a falha é apresentada, **Then** a interface informa que não foi possível carregar os dados e oferece uma ação de nova tentativa.
- **AC-RF8-02:** **Given** que uma solicitação de busca ou previsão permanece sem resposta por 10 segundos, **When** o limite de espera é atingido, **Then** a interface encerra o carregamento, informa que a solicitação expirou e oferece uma ação de nova tentativa.
- **AC-RF8-03:** **Given** que a pessoa aciona a nova tentativa e a consulta seguinte é bem-sucedida, **When** os dados são recebidos, **Then** a interface substitui o estado de erro pelos dados carregados.
- **AC-RF8-04:** **Given** que os dados atuais carregam com sucesso, mas a previsão falha, **When** o resultado é apresentado, **Then** os dados atuais permanecem visíveis e somente a seção de previsão mostra erro e ação de nova tentativa; o mesmo comportamento aplica-se no sentido inverso.
- **AC-RF8-05:** **Given** que a pessoa tenta novamente uma seção com falha e a solicitação tem sucesso, **When** os novos dados chegam, **Then** a seção de erro é substituída sem remover os dados válidos da outra seção.

### RF9 — Localização selecionada

- **AC-RF9-01:** **Given** que a pessoa seleciona uma cidade, **When** o clima atual e a previsão são carregados, **Then** ambos correspondem à localização selecionada.
- **AC-RF9-02:** **Given** que a pessoa seleciona uma cidade diferente, **When** os novos dados são carregados, **Then** o clima atual e a previsão exibidos correspondem à nova cidade.

### RF10 — Idioma

- **AC-RF10-01:** **Given** qualquer estado da aplicação, **When** a interface é apresentada, **Then** os textos, rótulos e mensagens visíveis são exibidos em português brasileiro (pt-BR).
- **AC-RF10-02:** **Given** uma previsão com datas, **When** as datas são apresentadas, **Then** os nomes dos dias estão em português e cada data usa o formato DD/MM/AAAA.

### Critérios transversais — RNF1, RNF2, RNF3, RNF5 e RNF7

- **AC-RNF1-01:** **Given** o teste executado em GitHub Actions (`ubuntu-latest`) com Playwright Chromium, viewport de 1280 × 720, cache desabilitado, conexão de 10 Mbps e latência de 50 ms, **When** três navegações independentes são medidas, **Then** a mediana do tempo até o campo de busca ficar visível e habilitado é de até 2 segundos.
- **AC-RNF1-02:** **Given** que uma busca foi enviada, **When** a aplicação aguarda os resultados, **Then** o indicador de carregamento aparece em até 100 ms.
- **AC-RNF2-01:** **Given** uma viewport com largura entre 320 px e 1920 px, **When** a tela principal é apresentada, **Then** busca, clima atual e previsão permanecem disponíveis sem rolagem horizontal, conteúdo essencial cortado ou sobreposição.
- **AC-RNF3-01:** **Given** que a pessoa navega usando somente o teclado, **When** percorre os controles da aplicação, **Then** todos os controles funcionais podem ser alcançados e o foco atual permanece visível.
- **AC-RNF3-02:** **Given** que controles e informações são apresentados, **When** são interpretados por tecnologia assistiva, **Then** os controles têm nomes acessíveis e os estados da interface são identificáveis semanticamente.
- **AC-RNF3-03:** **Given** texto comum ou texto grande apresentado na interface, **When** seu contraste com o fundo é medido, **Then** a razão é de pelo menos 4,5:1 para texto comum e 3:1 para texto grande.
- **AC-RNF7-01:** **Given** um dos navegadores e versões definidos em RNF7, **When** os fluxos de busca e consulta são executados, **Then** eles podem ser concluídos sem falha funcional.
- **AC-RNF5-01:** **Given** dados meteorológicos da Open-Meteo apresentados na interface, **When** a pessoa consulta o clima, **Then** o crédito com link para a fonte está visível.

## Non-Functional Requirements

- **RNF1 — Desempenho:** em GitHub Actions (`ubuntu-latest`) com Playwright Chromium, viewport de 1280 × 720, cache desabilitado, conexão de 10 Mbps e latência de 50 ms, a mediana de três navegações independentes deve exibir o campo de busca habilitado em até 2 segundos. O estado visual de carregamento deve aparecer em até 100 ms após o envio da busca; o tempo de resposta da API externa não faz parte desse limite.
- **RNF2 — Responsividade:** a interface deve ser funcional em larguras de viewport de 320 px a 1920 px, sem rolagem horizontal nem sobreposição de conteúdo essencial.
- **RNF3 — Acessibilidade:** conformidade WCAG 2.2 nível AA, incluindo navegação por teclado, foco visível, estrutura semântica, controles com nomes acessíveis e contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande (a partir de 18 pt, ou 14 pt em negrito).
- **RNF4 — Resiliência:** falhas de rede ou da fonte de dados não devem deixar a interface sem explicação; deve haver mensagem clara e possibilidade de nova tentativa.
- **RNF5 — Fonte pública sem chave e atribuição:** os dados devem vir do Open-Meteo, incluindo busca geográfica e previsão, sem exigir chave de API do usuário. A interface deve exibir crédito com link para o Open-Meteo. Os termos, limites de uso e requisitos de atribuição vigentes devem ser verificados antes de cada release de produção.
- **RNF6 — Clareza das mensagens:** mensagens de erro devem descrever o problema em linguagem compreensível e indicar a ação disponível, quando houver.
- **RNF7 — Compatibilidade:** a aplicação deve funcionar nas versões estáveis atual e imediatamente anterior, no momento de cada release, do Chrome, Edge, Firefox e Safari, incluindo Safari em iOS e Chrome em Android.

## Traceability Matrix

| User Story | Acceptance Criteria | Requisitos não funcionais relevantes |
| --- | --- | --- |
| US1 — Buscar uma cidade | AC-RF1-01–AC-RF1-04 | RNF1, RNF2, RNF3, RNF5, RNF6, RNF7 |
| US2 — Desambiguar cidades | AC-RF2-01–AC-RF2-02 | RNF2, RNF3, RNF5, RNF7 |
| US3 — Consultar o clima atual | AC-RF3-01–AC-RF3-03; AC-RF8-04–AC-RF8-05 | RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |
| US4 — Consultar a previsão | AC-RF4-01–AC-RF4-05; AC-RF8-04–AC-RF8-05 | RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |
| US5 — Consultar temperaturas na unidade desejada | AC-RF5-01–AC-RF5-05; AC-RF6-01 | RNF2, RNF3, RNF7 |
| US6 — Acompanhar a consulta | AC-RF7-01–AC-RF7-05; AC-RF8-01–AC-RF8-05 | RNF1, RNF3, RNF4, RNF6, RNF7 |
| US7 — Consultar a localização selecionada | AC-RF9-01–AC-RF9-02 | RNF2, RNF3, RNF4, RNF5, RNF7 |
| US8 — Usar a interface em português | AC-RF10-01–AC-RF10-02 | RNF2, RNF3, RNF6, RNF7 |
| Busca e experiência responsiva/acessível (critérios transversais) | AC-RNF1-01–AC-RNF1-02; AC-RNF2-01; AC-RNF3-01–AC-RNF3-03; AC-RNF5-01; AC-RNF7-01 | RNF1, RNF2, RNF3, RNF5, RNF7 |

## Edge Cases

- A busca não retorna cidades correspondentes.
- A busca retorna várias cidades com o mesmo nome ou nomes semelhantes.
- O campo de busca está vazio ou contém apenas espaços.
- O nome da cidade contém caracteres especiais válidos, como acentos, hífen ou apóstrofo.
- A pessoa inicia uma nova busca antes de a busca anterior terminar; os resultados exibidos devem corresponder à busca mais recente.
- A conexão falha durante a busca geográfica ou durante a obtenção da previsão.
- A busca geográfica ou a previsão não recebe resposta em até 10 segundos; o carregamento é encerrado, uma mensagem de expiração é apresentada e a pessoa pode tentar novamente.
- A fonte de dados está indisponível, limita solicitações ou devolve resposta inválida/incompleta.
- A fonte retorna uma localização válida, mas não possui um ou mais campos meteorológicos solicitados.
- A pessoa alterna a unidade enquanto os dados estão carregando ou após a consulta.
- A data local muda durante uma sessão no fuso horário da cidade selecionada, alterando quais são os cinco dias exibidos.
- Vento, precipitação ou outros valores são zero; devem ser diferenciados de dados ausentes.
- Uma previsão não pode ser carregada, embora a busca geográfica ou outra etapa tenha sido concluída.

## Assumptions

- O uso é individual e não requer conta ou autenticação.
- A maior parte das consultas ocorre com conexão à internet.
- O público utiliza as versões estáveis atual e imediatamente anterior dos navegadores definidos em RNF7.
- A previsão de cinco dias significa hoje mais os quatro dias seguintes.
- Celsius é a unidade inicial.
- A interface da versão inicial é exclusivamente pt-BR.
- A versão inicial não solicita nem usa geolocalização automática.
- Não há persistência de dados em servidor.
- A única preferência persistida no navegador é a unidade de temperatura; essa preferência não é enviada ao servidor.
- As consultas da v1 exigem conexão; não haverá cache local nem suporte offline.
- A v1 não mantém histórico de consultas nem cidades favoritas.
- A disponibilidade de campos específicos depende dos dados fornecidos pela fonte; o produto não deve fabricar valores ausentes.

## Risks

| Risco | Probabilidade | Impacto | Mitigação prevista |
| --- | --- | --- | --- |
| Limitação de solicitações ou indisponibilidade da fonte de dados | Média | Alto | Apresentar erro compreensível e permitir nova tentativa. |
| Cidade homônima ou localização incorreta selecionada | Alta | Médio | Exibir estado/região e país junto às opções de busca sempre que disponíveis. |
| Experiência inconsistente entre dispositivos | Média | Médio | Definir experiência mobile-first e validar os fluxos em tamanhos móveis e desktop. |
| Falha de rede da pessoa usuária | Média | Médio | Comunicar a falha e oferecer nova tentativa sem deixar a interface em carregamento indefinido. |
| Conversão ou aplicação inconsistente das unidades | Baixa | Alto | Aplicar uma única unidade ativa a todas as temperaturas visíveis e verificar consistência nos critérios de aceite. |
| Atraso na resposta da API externa | Média | Médio | Apresentar carregamento prontamente e manter os estados de espera e falha compreensíveis. |
| Alteração nos termos, limites de uso ou requisitos de atribuição da Open-Meteo | Média | Alto | Verificar as condições vigentes antes de cada release de produção, respeitar os limites e exibir o crédito com link para a fonte. |

## Out of Scope

- Geolocalização automática ou solicitação de permissão de localização.
- Autenticação, contas de usuário ou sincronização entre dispositivos.
- Persistência de dados em servidor.
- Histórico de condições meteorológicas.
- Gerenciamento de cidades favoritas.
- Suporte a idiomas além de pt-BR na versão inicial.
- Alertas, notificações, widgets ou previsões por hora.
- Cache local e funcionamento offline.

## Open Questions

Não há perguntas em aberto para a versão inicial. As decisões sobre cache/offline e histórico/favoritos foram fechadas: nenhum desses recursos fará parte da v1.