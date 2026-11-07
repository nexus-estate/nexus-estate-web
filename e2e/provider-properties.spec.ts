import { expect, test, type Page } from '@playwright/test';
import type { Estate } from '../lib/api/estate/estate.types';

test.skip(
  process.env.WEB_PLATFORM !== 'provider',
  'Requires the Provider runtime.',
);

const estates: Estate[] = Array.from({ length: 10 }, (_, index) => ({
  id: `estate-${index}`,
  providerId: 'provider-1',
  status: index === 8 ? 'ARCHIVED' : index === 9 ? 'DRAFT' : 'ACTIVE',
  title:
    index === 0
      ? 'Căn hộ kiểm thử với tên rất dài để kiểm tra bố cục và khả năng xuống dòng trên thiết bị di động'
      : `Bất động sản kiểm thử ${index}`,
  type: index === 1 ? 'LAND' : 'APARTMENT',
  purpose: index === 0 ? 'RENT' : 'SALE',
  price: index === 0 ? 18000000 : 4200000000,
  area: index === 1 ? null : 85,
  bedrooms: index === 1 ? null : 2,
  bathrooms: index === 1 ? null : 2,
  floors: null,
  description: null,
  addressLine: '12 Đường kiểm thử',
  provinceId: 'p1',
  wardId: 'w1',
  latitude: null,
  longitude: null,
  province: { id: 'p1', code: 'P', name: 'TP. Hồ Chí Minh' },
  ward: { id: 'w1', code: 'W', name: 'Phường kiểm thử' },
  createdAt: '',
  updatedAt: '',
}));

async function setup(
  page: Page,
  options: {
    empty?: boolean;
    fail?: boolean;
    readOnly?: boolean;
    delay?: boolean;
  } = {},
) {
  const state = {
    items: options.empty ? [] : structuredClone(estates),
    fail: options.fail ?? false,
    archived: 0,
    media: new Set<string>(),
    release: () => {},
  };
  const gate = options.delay
    ? new Promise<void>((resolve) => {
        state.release = resolve;
      })
    : Promise.resolve();
  await page.context().addCookies([
    {
      name: 'nexus.locale',
      value: 'vi',
      url: `http://localhost:${process.env.E2E_PORT ?? '3000'}`,
    },
  ]);
  await page.addInitScript(() => {
    localStorage.setItem('nexus.customer.access_token', 'test-token');
    localStorage.setItem(
      'nexus.customer.user',
      JSON.stringify({ id: 'customer-1', email: 'test@example.com' }),
    );
    localStorage.setItem('nexus.provider.active_id', 'provider-1');
    document.cookie = 'nexus.locale=vi; path=/';
  });
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = {};
    if (path.endsWith('/providers/me/authorization'))
      data = {
        platform: 'PROVIDER',
        providerId: 'provider-1',
        membershipId: 'member-1',
        roles: [],
        permissions: (options.readOnly
          ? ['property:read']
          : [
              'property:read',
              'property:create',
              'property:update',
              'property:archive',
              'listing:create',
              'listing:read',
            ]
        ).map((code) => ({ code })),
        providerStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        membershipStatus: 'ACTIVE',
        authorizationVersion: '1',
      };
    else if (path.endsWith('/providers/me'))
      data = {
        id: 'provider-1',
        displayName: 'Provider kiểm thử',
        type: 'INDIVIDUAL',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      };
    else if (path.endsWith('/listings/mine')) data = [];
    else if (path.endsWith('/estates/mine')) {
      await gate;
      if (state.fail) {
        await route.fulfill({ status: 500, json: { message: 'Test error' } });
        return;
      }
      data = state.items;
    } else if (path.endsWith('/listings/eligible-properties'))
      data = state.items
        .filter((item) => item.status === 'ACTIVE' && item.id !== 'estate-1')
        .map(({ id, title }) => ({ id, title }));
    else if (path.endsWith('/archive')) {
      state.archived++;
      const item = state.items.find((item) => path.includes(`/${item.id}/`))!;
      item.status = 'ARCHIVED';
      data = item;
    } else if (path.endsWith('/media')) {
      state.media.add(path);
      data = path.includes('/estate-0/')
        ? [
            {
              id: 'cover',
              estateId: 'estate-0',
              type: 'image',
              sortOrder: 0,
              mediaUrl: 'storage-key',
            },
          ]
        : path.includes('/estate-2/')
          ? [
              {
                id: 'later',
                estateId: 'estate-2',
                type: 'image',
                sortOrder: 5,
                mediaUrl: 'later-key',
              },
              {
                id: 'first',
                estateId: 'estate-2',
                type: 'image',
                sortOrder: 0,
                mediaUrl: 'cover-key',
              },
            ]
          : [];
    } else if (path.endsWith('/estate-2/media/first/content')) {
      await route.fulfill({
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
          'base64',
        ),
      });
      return;
    } else if (path.endsWith('/content')) {
      await route.fulfill({ status: 404 });
      return;
    } else if (path.endsWith('/authorization'))
      data = { permissions: [], roles: [] };
    await route.fulfill({ json: { status: true, data } });
  });
  return state;
}

test('edit uses the create layout, previews existing values and saves on desktop and mobile', async ({
  page,
}) => {
  await setup(page);
  const estate = {
    ...estates[0],
    title: 'Căn hộ The Sun Avenue',
    description: 'Căn hộ có ban công thoáng.',
  };
  let saved: Record<string, unknown> | undefined;
  await page.route('**/api/v1/estates/estate-0/mine', (route) =>
    route.fulfill({ json: { status: true, data: estate } }),
  );
  await page.route('**/api/v1/estates/estate-0', async (route) => {
    saved = route.request().postDataJSON();
    Object.assign(estate, saved);
    await route.fulfill({ json: { status: true, data: estate } });
  });
  await page.route('**/api/v1/locations/provinces', (route) =>
    route.fulfill({
      json: { status: true, data: [{ id: 'p1', name: 'TP. Hồ Chí Minh' }] },
    }),
  );
  await page.route('**/api/v1/locations/provinces/p1/wards', (route) =>
    route.fulfill({
      json: {
        status: true,
        data: [{ id: 'w1', name: 'Phường kiểm thử', type: 'ward' }],
      },
    }),
  );
  await page.setViewportSize({ width: 1568, height: 1000 });
  await page.goto('/provider/properties/estate-0/edit');
  await expect(page.locator('#estate-title')).toHaveValue(estate.title);
  await expect(page.locator('#estate-ward')).toHaveValue('w1');
  await expect(page.locator('.estate-preview h3')).toHaveText(estate.title);
  const fields = await page.locator('.estate-editor-sections').boundingBox();
  const preview = await page.locator('.estate-preview').boundingBox();
  expect(preview!.x).toBeGreaterThan(fields!.x + fields!.width);
  await page.screenshot({
    path: '/tmp/provider-edit-desktop.png',
    fullPage: true,
  });
  await page.locator('#estate-title').fill('Căn hộ đã chỉnh sửa');
  await page.locator('#estate-price').fill('4500000000');
  await expect(page.locator('.estate-preview h3')).toHaveText(
    'Căn hộ đã chỉnh sửa',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => {
      const box = (await page.locator('aside').first().boundingBox())!;
      return box.x + box.width;
    })
    .toBeLessThanOrEqual(0.5);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    JSON.stringify(
      await page.evaluate(() =>
        [...document.querySelectorAll('*')]
          .filter(
            (element) => element.getBoundingClientRect().right > innerWidth + 1,
          )
          .map((element) => ({
            tag: element.tagName,
            class: element.className,
            right: element.getBoundingClientRect().right,
          }))
          .slice(-20),
      ),
    ),
  ).toBe(true);
  const mobileFields = await page
    .locator('.estate-editor-sections')
    .boundingBox();
  const mobilePreview = await page.locator('.estate-preview').boundingBox();
  expect(mobilePreview!.y).toBeGreaterThan(mobileFields!.y);
  await page.screenshot({
    path: '/tmp/provider-edit-mobile.png',
    fullPage: true,
  });
  await page.locator('.estate-editor-actions button[type="submit"]').click();
  await expect(page).toHaveURL(/\/provider\/properties\/estate-0$/);
  expect(saved).toMatchObject({
    title: 'Căn hộ đã chỉnh sửa',
    price: 4500000000,
    wardId: 'w1',
    provinceId: 'p1',
    description: estate.description,
  });
  expect(saved).not.toHaveProperty('urbanWardId');
});

test('desktop inventory filters, paginates and confirms archive', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1568, height: 1000 });
  const state = await setup(page);
  await page.goto('/provider/properties');
  await expect(
    page.getByRole('heading', { name: 'Bất động sản của tôi' }),
  ).toBeVisible();
  await expect(page.locator('.inventory-card')).toHaveCount(8);
  await expect(
    page.getByText('Hiển thị 1–8 trong 10 bất động sản'),
  ).toBeVisible();
  await expect(
    page
      .locator('.inventory-card')
      .first()
      .getByRole('link', { name: 'Quản lý', exact: true }),
  ).toHaveAttribute('href', '/provider/properties/estate-0');
  await expect(
    page.locator('.inventory-card').nth(1).locator('.inventory-facts'),
  ).not.toContainText('m²');
  await expect(
    page.locator('.inventory-card').first().getByText('Chưa thể hiển thị ảnh'),
  ).toBeVisible();
  await page.screenshot({
    path: '/tmp/provider-properties-desktop.png',
    fullPage: true,
  });
  expect(state.media.size).toBe(8);
  await expect(
    page.locator('.inventory-card').nth(2).getByRole('img'),
  ).toHaveAttribute('src', /estate-2\/media\/first\/content$/);
  await expect(
    page
      .locator('.inventory-card')
      .nth(2)
      .getByRole('link', { name: 'Quản lý ảnh' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Tiếp', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('.inventory-card')).toHaveCount(2);
  await page
    .getByRole('button', { name: 'Chưa công khai', exact: true })
    .click();
  await expect(page).not.toHaveURL(/page=2/);
  await page.getByRole('searchbox').fill('không tìm thấy');
  await expect(page.getByText('Không có kết quả phù hợp.')).toBeVisible();
  await page.getByRole('button', { name: 'Xóa bộ lọc' }).click();
  await page.locator('.inventory-card').first().locator('summary').click();
  await page
    .locator('.inventory-card')
    .first()
    .getByRole('button', { name: 'Lưu trữ', exact: true })
    .click();
  expect(state.archived).toBe(0);
  await page.getByRole('dialog').getByRole('button', { name: 'Hủy' }).click();
  expect(state.archived).toBe(0);
  await expect(
    page.locator('.inventory-card').first().locator('summary'),
  ).toBeFocused();
  await page.locator('.inventory-card').first().locator('summary').click();
  await page
    .locator('.inventory-card')
    .first()
    .getByRole('button', { name: 'Lưu trữ', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Lưu trữ', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.locator('.inventory-card').first().getByText('Chưa công khai'),
  ).toBeVisible();
  expect(state.archived).toBe(1);
});

test('mobile cards and filters stay within viewport; URL survives reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto('/provider/properties?type=LAND');
  await expect(page.locator('.inventory-card')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('combobox')).toHaveValue('LAND');
  await page.getByRole('combobox').selectOption('');
  await expect(page.locator('.inventory-card')).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const card of await page.locator('.inventory-card').all()) {
    const box = await card.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  }
  await page.screenshot({
    path: '/tmp/provider-properties-mobile.png',
    fullPage: true,
  });
});

test('loading, error retry and empty inventory', async ({ page }) => {
  const state = await setup(page, { empty: true, fail: true, delay: true });
  await page.goto('/provider/properties');
  await expect(page.locator('.inventory-skeleton')).toHaveCount(3);
  state.release();
  await expect(
    page.getByRole('alert').getByText('Không thể tải bất động sản.'),
  ).toBeVisible({ timeout: 15000 });
  state.fail = false;
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(
    page.getByRole('heading', { name: 'Kho bất động sản của bạn' }),
  ).toBeVisible();
  await expect(
    page
      .locator('.inventory-state')
      .getByRole('link', { name: 'Thêm bất động sản' }),
  ).toBeVisible();
});

test('read-only permission hides all write actions', async ({ page }) => {
  await setup(page, { readOnly: true });
  await page.goto('/provider/properties');
  await expect(page.locator('.inventory-card')).toHaveCount(8);
  await expect(
    page.getByRole('link', {
      name: /Thêm bất động sản|Tạo tin đăng|Chỉnh sửa|Thêm ảnh|Quản lý ảnh/,
    }),
  ).toHaveCount(0);
  await expect(page.locator('.inventory-menu')).toHaveCount(0);
});

test('visibility filters cover all pages; draft reuse, publish and archive stay consistent', async ({
  page,
}) => {
  await setup(page);
  const listings = [
    {
      id: 'draft',
      estateId: 'estate-0',
      providerId: 'provider-1',
      status: 'DRAFT',
    },
    {
      id: 'public',
      estateId: 'estate-7',
      providerId: 'provider-1',
      status: 'PUBLISHED',
    },
  ];
  let creates = 0;
  let publishes = 0;
  await page.route('**/api/v1/listings**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === 'POST') {
      if (path.endsWith('/publish')) {
        publishes++;
        listings[0].status = 'PUBLISHED';
      } else if (path.endsWith('/archive')) listings[0].status = 'ARCHIVED';
      else creates++;
    }
    await route.fulfill({
      json: {
        status: true,
        data: path.endsWith('/mine') ? listings : listings[0],
      },
    });
  });
  await page.route('**/api/v1/providers/me/authorization', (route) =>
    route.fulfill({
      json: {
        status: true,
        data: {
          platform: 'PROVIDER',
          providerId: 'provider-1',
          membershipId: 'm',
          roles: [],
          permissions: [
            'property:read',
            'property:update',
            'listing:read',
            'listing:create',
            'listing:publish',
            'listing:archive',
          ].map((code) => ({ code })),
          providerStatus: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          membershipStatus: 'ACTIVE',
          authorizationVersion: '1',
        },
      },
    }),
  );
  await page.route('**/api/v1/estates/estate-0/mine', (route) =>
    route.fulfill({ json: { status: true, data: estates[0] } }),
  );
  await page.goto('/provider/properties');
  await page
    .getByRole('button', { name: 'Đang công khai', exact: true })
    .click();
  await expect(page.locator('.inventory-card')).toHaveCount(1);
  await expect(page.locator('.inventory-card')).toContainText(
    'Bất động sản kiểm thử 7',
  );
  await expect(
    page.getByRole('button', { name: 'Đang quảng bá', exact: true }),
  ).toHaveCount(0);
  await page.goto('/provider/properties/estate-0');
  await page
    .getByRole('button', { name: 'Đăng công khai', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: /Xem.*Marketplace|Xem trang công khai/ }),
  ).toBeVisible();
  expect(creates).toBe(0);
  expect(publishes).toBe(1);
  await page.screenshot({
    path: '/tmp/provider-property-detail-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect
    .poll(async () => {
      const box = (await page.locator('aside').first().boundingBox())!;
      return box.x + box.width;
    })
    .toBeLessThanOrEqual(0.5);
  await page.screenshot({
    path: '/tmp/provider-property-detail-mobile.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'Ngừng công khai', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Ngừng công khai', exact: true })
    .click();
  await expect(
    page.getByText('Tin đã ngừng công khai.', { exact: false }),
  ).toBeVisible();
  await page.goto('/provider/properties?status=public');
  await expect(page.locator('.inventory-card')).toHaveCount(1);
  await expect(page.locator('.inventory-card')).toContainText(
    'Bất động sản kiểm thử 7',
  );
});

test('unknown visibility shows retry and hides public filters rather than guessing', async ({
  page,
}) => {
  await setup(page);
  let failed = true;
  await page.route('**/api/v1/listings/mine', (route) =>
    failed
      ? route.fulfill({ status: 500, json: { message: 'unavailable' } })
      : route.fulfill({ json: { status: true, data: [] } }),
  );
  await page.goto('/provider/properties');
  await expect(
    page.getByText('Không tải được trạng thái Marketplace. Vui lòng thử lại.'),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole('button', { name: 'Chưa công khai', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.inventory-card').first()).toContainText(
    'Chưa xác định trạng thái',
  );
  failed = false;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Chưa công khai', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.inventory-card').first()).toContainText(
    'Chưa công khai',
  );
});

test('property without listing creates once and reuses the draft after a publish failure', async ({
  page,
}) => {
  await setup(page);
  const listings: Array<{
    id: string;
    estateId: string;
    providerId: string;
    status: string;
  }> = [];
  let creates = 0;
  let publishes = 0;
  await page.route('**/api/v1/providers/me/authorization', (route) =>
    route.fulfill({
      json: {
        status: true,
        data: {
          platform: 'PROVIDER',
          providerId: 'provider-1',
          membershipId: 'm',
          roles: [],
          permissions: [
            'property:read',
            'listing:read',
            'listing:create',
            'listing:publish',
          ].map((code) => ({ code })),
          providerStatus: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          membershipStatus: 'ACTIVE',
          authorizationVersion: '1',
        },
      },
    }),
  );
  await page.route('**/api/v1/estates/estate-1/mine', (route) =>
    route.fulfill({ json: { status: true, data: estates[1] } }),
  );
  await page.route('**/api/v1/listings**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === 'POST') {
      if (path.endsWith('/publish')) {
        publishes++;
        if (publishes === 1) {
          await route.fulfill({
            status: 409,
            json: { message: 'Please retry publishing' },
          });
          return;
        }
        listings[0].status = 'PUBLISHED';
      } else {
        creates++;
        listings.push({
          id: 'created',
          estateId: 'estate-1',
          providerId: 'provider-1',
          status: 'DRAFT',
        });
      }
    }
    await route.fulfill({
      json: {
        status: true,
        data: path.endsWith('/mine') ? listings : listings[0],
      },
    });
  });
  await page.goto('/provider/properties/estate-1');
  await page
    .getByRole('button', { name: 'Đăng công khai', exact: true })
    .click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.property-detail-heading')).toContainText(
    'Chưa công khai',
  );
  await page
    .getByRole('button', { name: 'Đăng công khai', exact: true })
    .click();
  await expect(page.locator('.property-detail-heading')).toContainText(
    'Đang công khai',
  );
  expect(creates).toBe(1);
  expect(publishes).toBe(2);
  await page.goto('/provider/listings/created');
  await expect(
    page.getByRole('heading', {
      name: estates[1].title,
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
});

test('multiple listings keep one card and old detail URL selects the matching listing', async ({
  page,
}) => {
  await setup(page);
  const listings = [
    {
      id: 'first',
      estateId: 'estate-1',
      providerId: 'provider-1',
      status: 'PUBLISHED',
    },
    {
      id: 'second',
      estateId: 'estate-1',
      providerId: 'provider-1',
      status: 'DRAFT',
    },
  ];
  await page.route('**/api/v1/listings/mine', (route) =>
    route.fulfill({ json: { status: true, data: listings } }),
  );
  await page.route('**/api/v1/estates/estate-1/mine', (route) =>
    route.fulfill({ json: { status: true, data: estates[1] } }),
  );
  await page.goto('/provider/properties?status=public');
  await expect(page.locator('.inventory-card')).toHaveCount(1);
  await page.goto('/provider/listings/second');
  await expect(
    page.getByRole('combobox', { name: 'Chọn tin đăng' }),
  ).toHaveValue('second');
  await expect(page.locator('.property-detail-heading')).toContainText(
    'Đang công khai',
  );
  await expect(page.locator('.property-detail-grid aside')).toContainText(
    'Chưa công khai',
  );
  await page
    .getByRole('combobox', { name: 'Chọn tin đăng' })
    .selectOption('first');
  await expect(page.locator('.property-detail-grid aside')).toContainText(
    'Đang công khai',
  );
  await expect(
    page.getByRole('link', { name: 'Xem trên Marketplace' }),
  ).toHaveAttribute('href', /\/properties\/first$/);
});
