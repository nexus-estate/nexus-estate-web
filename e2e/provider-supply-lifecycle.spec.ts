import { expect, test, type APIRequestContext } from '@playwright/test';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:50001/api/v1';
const providerBaseURL = `http://localhost:${process.env.E2E_PROVIDER_PORT ?? '3003'}`;
const adminEmail = 'superadmin@nexus-estate.local';
const adminPassword = 'NexusEstate#SuperAdmin2026!';

type Envelope<T> = { data: T };
type TokenPair = { accessToken: string };
type ProviderRegistration = { providerAccount: { id: string } };

async function data<T>(
  response: Awaited<ReturnType<APIRequestContext['post']>>,
) {
  const body = (await response.json()) as Envelope<T>;
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  return body.data;
}

test('runs the Provider Property to Listing lifecycle in the browser', async ({
  browser,
  request,
}) => {
  test.setTimeout(60_000);
  const runId = process.env.GITHUB_RUN_ID ?? `local-${process.pid}`;
  const runKey = `${runId}-${test.info().retry}`;
  const email = `supply-lifecycle-${runKey}@nexus.test`;
  const password = 'supply-lifecycle-password';
  const propertyTitle = `Supply Property ${runKey}`;

  const registrationResponse = await request.post(
    `${apiUrl}/customers/register`,
    {
      data: { email, password },
    },
  );
  await data(registrationResponse);

  const customerLogin = await request.post(`${apiUrl}/customers/auth/login`, {
    data: { email, password },
  });
  const customerToken = (await data<TokenPair>(customerLogin)).accessToken;

  const providerRegistration = await request.post(
    `${apiUrl}/providers/register/from-customer`,
    {
      headers: { Authorization: `Bearer ${customerToken}` },
      data: { type: 'INDIVIDUAL', displayName: `Supply Provider ${runKey}` },
    },
  );
  const providerId = (await data<ProviderRegistration>(providerRegistration))
    .providerAccount.id;

  const adminLogin = await request.post(`${apiUrl}/administration/auth/login`, {
    data: { email: adminEmail, password: adminPassword },
  });
  const adminToken = (await data<TokenPair>(adminLogin)).accessToken;
  const approval = await request.post(
    `${apiUrl}/administration/provider-registrations/${providerId}/approve`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
  );
  await data(approval);

  const context = await browser.newContext({ baseURL: providerBaseURL });
  const page = await context.newPage();
  try {
    await page.goto('/provider');
    await expect(page).toHaveURL(/\/signin\?/);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: /Sign in|Đăng nhập/ }).click();
    await expect(page).toHaveURL(/\/provider$/);

    await page.goto('/provider/properties/new');
    await page.locator('#estate-title').fill(propertyTitle);
    await page.locator('#estate-price').fill('3500000000');
    await page.locator('#estate-addressLine').fill('1 Supply Street');
    await page.locator('#estate-province').selectOption({ index: 1 });
    await expect(page.locator('#estate-ward option').nth(1)).toBeAttached();
    await page.locator('#estate-ward').selectOption({ index: 1 });
    await page
      .locator('form')
      .getByRole('button', { name: /Add property|Thêm bất động sản/ })
      .click();
    await expect(page).toHaveURL(/\/provider\/properties$/);
    await expect(page.getByText(propertyTitle, { exact: true })).toBeVisible();

    const propertyRow = page.locator('li').filter({ hasText: propertyTitle });
    await expect(
      propertyRow.getByText(/Not public|Chưa công khai/, { exact: true }),
    ).toBeVisible();

    await page.goto('/provider/listings/new');
    const propertySelect = page.locator('#listing-estate');
    await expect(propertySelect.locator('option').nth(1)).toContainText(
      propertyTitle,
    );
    await propertySelect.selectOption({ label: propertyTitle });
    await page
      .locator('form')
      .getByRole('button', { name: /Create draft|Tạo bản nháp/ })
      .click();
    await expect(page).toHaveURL(/\/provider\/properties$/);

    const headers = {
      Authorization: `Bearer ${customerToken}`,
      'X-Provider-Id': providerId,
    };
    const drafts = await data<
      { id: string; estateId: string; status: string }[]
    >(await request.get(`${apiUrl}/listings/mine`, { headers }));
    expect(drafts).toHaveLength(1);
    expect(drafts[0].status).toBe('DRAFT');
    const listingId = drafts[0].id;
    const estateId = drafts[0].estateId;
    await propertyRow.getByRole('link', { name: /^Manage$|^Quản lý$/ }).click();
    await expect(
      page.getByRole('heading', { name: propertyTitle, level: 1, exact: true }),
    ).toBeVisible();
    // A draft profile cannot be published until it has been activated.
    await expect(
      page.getByRole('button', { name: /^Publish$|^Đăng công khai$/ }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: /Activate|Kích hoạt/ }).click();
    await page
      .getByRole('button', { name: /^Publish$|^Đăng công khai$/ })
      .click();
    await expect(
      page.getByRole('link', {
        name: /View on Marketplace|Xem trên Marketplace/,
      }),
    ).toBeVisible();
    const published = await data<{ id: string; status: string }>(
      await request.get(`${apiUrl}/listings/${listingId}`),
    );
    expect(published).toMatchObject({ id: listingId, status: 'PUBLISHED' });
    expect(
      await data<unknown[]>(
        await request.get(`${apiUrl}/listings/mine`, { headers }),
      ),
    ).toHaveLength(1);

    await page.goto('/provider/properties');
    const blockedArchiveRow = page
      .locator('li')
      .filter({ hasText: propertyTitle });
    await blockedArchiveRow.locator('summary').click();
    await blockedArchiveRow
      .getByRole('button', { name: /Archive|Lưu trữ/ })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Archive|Lưu trữ/, exact: true })
      .click();
    await expect(
      page.getByText(/cannot be archived while|Không thể lưu trữ bất động sản/),
    ).toBeVisible();

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Cancel|Hủy/ })
      .click();
    await blockedArchiveRow
      .getByRole('link', { name: /^Manage$|^Quản lý$/ })
      .click();
    await page
      .getByRole('button', { name: /Stop publishing|Ngừng công khai/ })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Stop publishing|Ngừng công khai/ })
      .click();
    await expect(
      page.getByText(/This listing is archived|Tin đã ngừng công khai/),
    ).toBeVisible();
    expect(
      (await request.get(`${apiUrl}/listings/${listingId}`)).status(),
    ).toBe(404);

    await page.goto('/provider/properties');
    const propertyAfterListingArchive = page
      .locator('li')
      .filter({ hasText: propertyTitle });
    await propertyAfterListingArchive.locator('summary').click();
    await propertyAfterListingArchive
      .getByRole('button', { name: /Archive|Lưu trữ/ })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Archive|Lưu trữ/, exact: true })
      .click();
    const restore = propertyAfterListingArchive.getByRole('button', {
      name: /Restore|Khôi phục/,
    });
    await expect(restore).toBeVisible();
    await restore.click();
    await expect(
      propertyAfterListingArchive.getByRole('button', {
        name: /Activate|Kích hoạt/,
      }),
    ).toBeVisible();
    expect(
      await data<{ status: string }>(
        await request.get(`${apiUrl}/estates/${estateId}/mine`, { headers }),
      ),
    ).toMatchObject({ status: 'DRAFT' });
  } finally {
    await context.close();
  }
});
