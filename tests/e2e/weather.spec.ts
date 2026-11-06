import { test, expect, type Page } from '@playwright/test';
import type { City } from '../../src/types/weather';

const LISBON = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.72,
  longitude: -9.13,
};

const PORTO = {
  id: 2,
  name: 'Porto',
  country: 'Portugal',
  admin1: 'Porto',
  latitude: 41.15,
  longitude: -8.61,
};

const HOMONYMS = [
  {
    id: 3,
    name: "São-João d'Ávila",
    country: 'Brasil',
    admin1: 'Ceará',
    latitude: -3.7,
    longitude: -40.3,
  },
  {
    id: 4,
    name: "São-João d'Ávila",
    country: 'Brasil',
    admin1: 'Bahia',
    latitude: -12.9,
    longitude: -38.5,
  },
];

const DATES = ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'];

function makeForecast(latitude = LISBON.latitude) {
  const temperature = latitude === PORTO.latitude ? 12 : latitude === HOMONYMS[1].latitude ? 28 : 20;

  return {
    timezone: 'Europe/Lisbon',
    current: {
      time: '2026-06-16T12:00',
      temperature_2m: temperature,
      relative_humidity_2m: 80,
      wind_speed_10m: 10,
      surface_pressure: 1015,
      precipitation: 0,
      weather_code: 3,
    },
    daily: {
      time: DATES,
      weather_code: [3, 61, 80, 1, 0],
      temperature_2m_max: [temperature + 4, 19, 22, 24, 25],
      temperature_2m_min: [temperature - 4, 11, 13, 14, 15],
      precipitation_sum: [0, 0.2, 1.5, 4, 0],
      wind_speed_10m_max: [12, 14, 10, 20, 8],
    },
  };
}

async function mockGeocoding(
  page: Page,
  getResults: (query: string) => City[],
  delayMs = 0,
) {
  const queries: string[] = [];
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('name') ?? '';
    queries.push(query);
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({ json: { results: getResults(query) } });
  });
  return queries;
}

async function mockForecast(page: Page, resolveResponse = (latitude: number) => makeForecast(latitude)) {
  const requests: URL[] = [];
  await page.route('**/api.open-meteo.com/**', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url);
    const latitude = Number(url.searchParams.get('latitude'));
    await route.fulfill({ json: resolveResponse(latitude) });
  });
  return requests;
}

async function submitSearch(page: Page, query: string) {
  await page.getByRole('textbox', { name: 'Buscar cidade' }).fill(query);
  await page.getByRole('button', { name: 'Buscar' }).click();
}

async function chooseCity(page: Page, city: { name: string; admin1: string; country: string }) {
  await page.getByRole('button', { name: `${city.name}, ${city.admin1}, ${city.country}` }).click();
}

test('T-37 busca termo especial e aguarda seleção explícita entre homônimas', async ({ page }) => {
  const queries = await mockGeocoding(page, () => HOMONYMS);
  const weatherRequests = await mockForecast(page);
  await page.goto('/');

  await submitSearch(page, "São-João d'Ávila");

  await expect(page.getByRole('list', { name: 'Resultados da busca' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ceará, Brasil/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Bahia, Brasil/ })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Clima atual' })).toHaveCount(0);
  expect(queries).toEqual(["São-João d'Ávila"]);
  expect(weatherRequests).toHaveLength(0);

  await chooseCity(page, HOMONYMS[1]);

  await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
  await expect(page.getByText('28°')).toBeVisible();
  expect(weatherRequests).toHaveLength(1);
  expect(weatherRequests[0]?.searchParams.get('latitude')).toBe(String(HOMONYMS[1].latitude));
});

test('T-38 mostra current e cinco dias, troca unidade sem novo request e persiste preferência', async ({
  page,
}) => {
  await mockGeocoding(page, (query) => (query === 'Porto' ? [PORTO] : [LISBON]));
  const weatherRequests = await mockForecast(page);
  await page.goto('/');

  await submitSearch(page, 'Lisboa');
  await chooseCity(page, LISBON);

  const current = page.getByRole('region', { name: 'Clima atual' });
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(current.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(current.getByText('20°')).toBeVisible();
  await expect(current.getByText('Umidade')).toBeVisible();
  await expect(current.getByText('80%')).toBeVisible();
  await expect(current.getByText('10 km/h')).toBeVisible();
  await expect(current.getByText('1015 hPa')).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  await expect(forecast.getByText('16/06/2026')).toBeVisible();
  await expect(forecast.getByText('20/06/2026')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
    'href',
    'https://open-meteo.com/',
  );

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(current.getByText('68°')).toBeVisible();
  const firstForecastDay = forecast.getByRole('listitem').first();
  await expect(firstForecastDay.getByText('75°')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(weatherRequests).toHaveLength(1);

  await page.getByRole('button', { name: 'Celsius' }).click();
  await expect(current.getByText('20°')).toBeVisible();
  await expect(firstForecastDay.getByText('24°')).toBeVisible();
  expect(weatherRequests).toHaveLength(1);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['weather-app-unit']);

  await submitSearch(page, 'Porto');
  await chooseCity(page, PORTO);
  await expect(page.getByRole('heading', { name: 'Porto' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Clima atual' }).getByText('54°')).toBeVisible();
  expect(weatherRequests.at(-1)?.searchParams.get('latitude')).toBe(String(PORTO.latitude));
});

test('T-39 distingue busca vazia de erro e recupera após retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 503, body: 'unavailable' });
      return;
    }
    await route.fulfill({ json: { results: [LISBON] } });
  });
  await mockForecast(page);
  await page.goto('/');

  await submitSearch(page, 'Lisboa');
  await expect(page.getByRole('alert')).toContainText('Não foi possível buscar');
  await expect(page.getByText(/nenhuma cidade encontrada/i)).toHaveCount(0);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('list', { name: 'Resultados da busca' })).toBeVisible();
  expect(attempts).toBe(2);

  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: {} }),
  );
  await submitSearch(page, 'cidade inexistente');
  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('T-39 informa timeout de 10s e retry substitui o erro por resultados', async ({ page }) => {
  test.setTimeout(30_000);
  let attempts = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await new Promise((resolve) => setTimeout(resolve, 10_500));
      try {
        await route.fulfill({ json: { results: [LISBON] } });
      } catch {
        // A primeira solicitação é abortada pelo timeout do serviço.
      }
      return;
    }
    await route.fulfill({ json: { results: [LISBON] } });
  });
  await page.goto('/');

  await submitSearch(page, 'Lisboa');
  await expect(page.getByRole('status')).toContainText('Carregando');
  await expect(page.getByRole('alert')).toContainText('demorou demais', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('list', { name: 'Resultados da busca' })).toBeVisible();
  expect(attempts).toBe(2);
});

test('T-39 retry de forecast não refaz current já carregado', async ({ page }) => {
  await mockGeocoding(page, () => [LISBON]);
  let weatherCall = 0;
  const requests: URL[] = [];
  await page.route('**/api.open-meteo.com/**', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url);
    weatherCall += 1;
    const payload = makeForecast();
    if (weatherCall === 1) payload.daily.time = DATES.slice(0, 4);
    await route.fulfill({ json: payload });
  });
  await page.goto('/');

  await submitSearch(page, 'Lisboa');
  await chooseCity(page, LISBON);

  const current = page.getByRole('region', { name: 'Clima atual' });
  await expect(current.getByText('20°')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('alert')).toBeVisible();
  await page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem')).toHaveCount(5);
  await expect(current.getByText('20°')).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[1]?.searchParams.has('current')).toBe(false);
  expect(requests[1]?.searchParams.has('daily')).toBe(true);
});

for (const width of [320, 375]) {
  test(`T-40 fluxo mobile completo sem overflow em ${width}px`, async ({ page }) => {
    await mockGeocoding(page, () => [LISBON]);
    let weatherCall = 0;
    await page.route('**/api.open-meteo.com/**', async (route) => {
      weatherCall += 1;
      const payload = makeForecast();
      if (weatherCall === 1) payload.daily.time = DATES.slice(0, 4);
      await route.fulfill({ json: payload });
    });
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');

    await submitSearch(page, 'Lisboa');
    await chooseCity(page, LISBON);
    await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();

    const viewportFits = () =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(await viewportFits()).toBe(true);
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem')).toHaveCount(5);
    expect(await viewportFits()).toBe(true);

    for (const locator of [
      page.getByRole('textbox', { name: 'Buscar cidade' }),
      page.getByRole('group', { name: 'Unidade de temperatura' }),
      page.getByRole('region', { name: 'Clima atual' }),
      page.getByRole('region', { name: 'Previsão de 5 dias' }),
    ]) {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
    }
  });
}

test('T-41 navega por teclado, seleciona cidade, usa retry/unidade e mantém foco visível', async ({
  page,
}) => {
  await mockGeocoding(page, () => [LISBON, PORTO]);
  let weatherCall = 0;
  await page.route('**/api.open-meteo.com/**', async (route) => {
    weatherCall += 1;
    const payload = makeForecast();
    if (weatherCall === 1) payload.daily.time = DATES.slice(0, 4);
    await route.fulfill({ json: payload });
  });
  await page.goto('/');

  await page.keyboard.press('Tab');
  const searchInput = page.getByRole('textbox', { name: 'Buscar cidade' });
  await expect(searchInput).toBeFocused();
  await page.keyboard.type('Lisboa');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeFocused();
  await page.keyboard.press('Enter');

  const portoOption = page.getByRole('button', { name: 'Porto, Porto, Portugal' });
  await expect(portoOption).toBeVisible();
  let focused = false;
  for (let index = 0; index < 12 && !focused; index += 1) {
    await page.keyboard.press('Tab');
    focused = await portoOption.evaluate((element) => element === document.activeElement);
  }
  expect(focused).toBe(true);
  expect(await portoOption.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
  await expect(page.getByRole('alert')).toBeVisible();

  const retryButton = page.getByRole('button', { name: 'Tentar novamente' });
  focused = false;
  for (let index = 0; index < 12 && !focused; index += 1) {
    await page.keyboard.press('Tab');
    focused = await retryButton.evaluate((element) => element === document.activeElement);
  }
  expect(focused).toBe(true);
  expect(await retryButton.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem')).toHaveCount(5);

  const fahrenheit = page.getByRole('button', { name: 'Fahrenheit' });
  focused = false;
  for (let index = 0; index < 12 && !focused; index += 1) {
    await page.keyboard.press('Tab');
    focused = await fahrenheit.evaluate((element) => element === document.activeElement);
  }
  expect(focused).toBe(true);
  expect(await fahrenheit.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Celsius' })).toBeFocused();
  expect(
    await page.getByRole('button', { name: 'Celsius' }).evaluate((element) => getComputedStyle(element).boxShadow),
  ).not.toBe('none');
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('T-41 audita contraste mínimo das combinações de texto e fundo exibidas', async ({ page }) => {
  await mockGeocoding(page, () => [LISBON]);
  await mockForecast(page);
  await page.goto('/');
  await submitSearch(page, 'Lisboa');
  await chooseCity(page, LISBON);
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();

  const violations = await page.locator('body').evaluate((body) => {
    type Color = { red: number; green: number; blue: number; alpha: number };
    const parse = (value: string): Color | null => {
      const channels = value.match(/[\d.]+/g)?.map(Number);
      if (!channels || channels.length < 3) return null;
      return {
        red: channels[0] ?? 0,
        green: channels[1] ?? 0,
        blue: channels[2] ?? 0,
        alpha: channels.length > 3 ? (channels[3] ?? 1) : 1,
      };
    };
    const over = (foreground: Color, background: Color): Color => ({
      red: foreground.red * foreground.alpha + background.red * (1 - foreground.alpha),
      green: foreground.green * foreground.alpha + background.green * (1 - foreground.alpha),
      blue: foreground.blue * foreground.alpha + background.blue * (1 - foreground.alpha),
      alpha: 1,
    });
    const luminance = (color: Color) => {
      const channels = [color.red, color.green, color.blue].map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
    };
    const base = { red: 11, green: 16, blue: 32, alpha: 1 };
    const backgroundFor = (element: HTMLElement) => {
      const ancestors = [];
      let current: HTMLElement | null = element;
      while (current && current !== body) {
        ancestors.push(current);
        current = current.parentElement;
      }
      let background = base;
      for (const ancestor of ancestors.reverse()) {
        const color = parse(getComputedStyle(ancestor).backgroundColor);
        if (color && color.alpha > 0) background = over(color, background);
      }
      return background;
    };
    const measure = (
      text: string,
      foreground: Color | null,
      background: Color,
      fontSize: number,
      fontWeight: string,
    ) => {
      if (!foreground) return [];
      const visibleForeground = foreground.alpha < 1 ? over(foreground, background) : foreground;
      const values = [luminance(visibleForeground), luminance(background)].sort(
        (first, second) => second - first,
      );
      const ratio = ((values[0] ?? 0) + 0.05) / ((values[1] ?? 0) + 0.05);
      const isBold = Number.parseInt(fontWeight, 10) >= 700;
      const minimum = fontSize >= 24 || (fontSize >= 18.67 && isBold) ? 3 : 4.5;
      return ratio < minimum ? [{ text: text.slice(0, 50), ratio, minimum }] : [];
    };

    const textViolations = Array.from(body.querySelectorAll<HTMLElement>('*'))
      .filter((element) => {
        const style = getComputedStyle(element);
        return Boolean(element.innerText?.trim()) && style.display !== 'none' && style.visibility !== 'hidden' && element.getAttribute('aria-hidden') !== 'true';
      })
      .flatMap((element) => {
        const style = getComputedStyle(element);
        return measure(
          element.innerText.trim(),
          parse(style.color),
          backgroundFor(element),
          Number.parseFloat(style.fontSize),
          style.fontWeight,
        );
      });
    const placeholderViolations = Array.from(body.querySelectorAll<HTMLInputElement>('input'))
      .filter((input) => Boolean(input.getAttribute('placeholder')))
      .flatMap((input) => {
        const style = getComputedStyle(input, '::placeholder');
        return measure(
          input.getAttribute('placeholder') ?? '',
          parse(style.color),
          backgroundFor(input),
          Number.parseFloat(style.fontSize),
          style.fontWeight,
        );
      });

    return [...textViolations, ...placeholderViolations];
  });

  expect(violations).toEqual([]);
});

test('T-42 mede inicialização em 3 navegações e loading em até 100ms', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Medição de performance definida para Chromium.');
  await mockGeocoding(page, () => [LISBON], 250);
  const session = await page.context().newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 50,
    downloadThroughput: 1_250_000,
    uploadThroughput: 625_000,
    connectionType: 'cellular3g',
  });

  const navigationTimes: number[] = [];
  for (let index = 0; index < 3; index += 1) {
    await session.send('Network.clearBrowserCache');
    await page.goto('about:blank');
    const start = Date.now();
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Buscar cidade' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Buscar cidade' })).toBeEnabled();
    navigationTimes.push(Date.now() - start);
  }
  navigationTimes.sort((first, second) => first - second);
  expect(navigationTimes[1]).toBeLessThanOrEqual(2_000);

  await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('Lisboa');
  const start = Date.now();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('status')).toBeVisible({ timeout: 100 });
  expect(Date.now() - start).toBeLessThanOrEqual(100);
});

test('T-43 mantém mensagens, condições e datas em pt-BR', async ({ page }) => {
  await mockGeocoding(page, (query) => (query === 'inexistente' ? [] : [LISBON]));
  await mockForecast(page);
  await page.goto('/');

  await expect(page.getByRole('textbox', { name: 'Buscar cidade' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
  await submitSearch(page, 'inexistente');
  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
  await submitSearch(page, 'Lisboa');
  await chooseCity(page, LISBON);

  await expect(page.getByRole('region', { name: 'Clima atual' }).getByText('Nublado')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' }).getByText('Hoje')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' }).getByText('Amanhã')).toBeVisible();
  await expect(page.getByText('16/06/2026')).toBeVisible();
  await expect(page.getByText('20/06/2026')).toBeVisible();
});
