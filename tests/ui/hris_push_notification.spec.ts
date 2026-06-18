import { test, expect } from '@playwright/test';
import { login } from '../../helpers/login.helper';

const TITLE = 'Test Automation';

test('Push Notification sent successfully', async ({ page }) => {
  await login(page); // precondition

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.getByRole('link', { name: 'Push Notifications' }).click();
  await expect(page.getByRole('heading', { name: 'Push Notifications' })).toBeVisible();

  await page.getByRole('link', { name: 'Send New Push Notifications' }).click();
  await expect(page.getByRole('heading', { name: 'Send New Push Notification' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Notification Title*' }).fill(TITLE);
  
  await page.getByLabel('Filter by Department').selectOption('3');
  await page.getByLabel('Filter by Site').selectOption('34');

  await page.getByRole('button', { name: 'Choose recipients' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('manager multi department');
  await page.getByRole('option', { name: 'Manager Multi Department' }).click();

  await page.getByRole('textbox', { name: 'Message Body*' }).fill('Test Automation');

  const imagePath = 'assets/image.jpg';
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Browse').click(),
  ]);
  await fileChooser.setFiles(imagePath);

  await expect(
    page.locator('span.filepond--file-status-main', { hasText: 'Upload complete' })
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.locator('.filepond--file-info', { hasText: 'image.jpg' })
  ).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Send Push Notification' }).click();
  await expect(page.getByText('Notification sent successfully')).toBeVisible();

  console.log('✅ Push Notification sent successfully.');
});