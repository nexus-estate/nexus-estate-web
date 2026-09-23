import { expect, test, type APIRequestContext } from '@playwright/test';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:50001/api/v1';
const providerBaseURL = `http://localhost:${process.env.E2E_PROVIDER_PORT ?? '3001'}`;
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
    await page.locator('#estate-address').fill('1 Supply Street');
    await page.locator('#estate-province').selectOption({ index: 1 });
    await expect(page.locator('#estate-ward option').nth(1)).toBeAttached();
    await page.locator('#estate-ward').selectOption({ index: 1 });
    await page
      .locator('form')
      .getByRole('button', { name: /Create Property|Tạo bất động sản/ })
      .click();
    await expect(page).toHaveURL(/\/provider\/properties$/);
    await expect(page.getByText(propertyTitle, { exact: true })).toBeVisible();

    const propertyRow = page.locator('li').filter({ hasText: propertyTitle });
    await expect(
      propertyRow.getByText(/Draft|Bản nháp/, { exact: true }),
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
    await expect(page).toHaveURL(/\/provider\/listings$/);

    const listingRow = page.locator('li').filter({ hasText: propertyTitle });
    await expect(
      listingRow.getByText(/Draft|Bản nháp/, { exact: true }),
    ).toBeVisible();
    await listingRow.getByRole('button', { name: /Publish|Xuất bản/ }).click();
    await expect(
      page.getByText(
        /Property must be active|phải ở trạng thái đang hoạt động/,
      ),
    ).toBeVisible();

    await page.goto('/provider/properties');
    const activePropertyRow = page
      .locator('li')
      .filter({ hasText: propertyTitle });
    await activePropertyRow
      .getByRole('button', { name: /Activate|Kích hoạt/ })
      .click();
    await expect(
      activePropertyRow.getByText(/Active|Đang hoạt động/, { exact: true }),
    ).toBeVisible();

    await page.goto('/provider/listings');
    const publishedListingRow = page
      .locator('li')
      .filter({ hasText: propertyTitle });
    await publishedListingRow
      .getByRole('button', { name: /Publish|Xuất bản/ })
      .click();
    await expect(
      publishedListingRow.getByText(/Published|Đã xuất bản/, { exact: true }),
    ).toBeVisible();

    await page.goto('/provider/properties');
    const blockedArchiveRow = page
      .locator('li')
      .filter({ hasText: propertyTitle });
    await blockedArchiveRow
      .getByRole('button', { name: /Archive|Lưu trữ/ })
      .click();
    await expect(
      page.getByText(/cannot be archived while|Không thể lưu trữ bất động sản/),
    ).toBeVisible();

    await page.goto('/provider/listings');
    await publishedListingRow
      .getByRole('button', { name: /Archive|Lưu trữ/ })
      .click();
    await expect(
      publishedListingRow.getByText(/Archived|Đã lưu trữ/, { exact: true }),
    ).toBeVisible();

    await page.goto('/provider/properties');
    const propertyAfterListingArchive = page
      .locator('li')
      .filter({ hasText: propertyTitle });
    await propertyAfterListingArchive
      .getByRole('button', { name: /Archive|Lưu trữ/ })
      .click();
    await expect(
      propertyAfterListingArchive.getByText(/Archived|Đã lưu trữ/, {
        exact: true,
      }),
    ).toBeVisible();
    await propertyAfterListingArchive
      .getByRole('button', { name: /Restore|Khôi phục/ })
      .click();
    await expect(
      propertyAfterListingArchive.getByText(/Draft|Bản nháp/, { exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
