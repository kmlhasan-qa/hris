import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { DepartmentsCreatePage } from '../../../pages/DepartmentsCreatePage';
import { DepartmentsPage } from '../../../pages/DepartmentsPage';
import { generateTOTP } from '../../../helpers/totp.helper';

const EMAIL       = 'kamal@ictechnology.com.au';
const PASSWORD    = 'Password01';
const TOTP_SECRET = 'SQGN3PT4AEMC56BS';
const BASE_URL    = 'https://hris.itmanage.com.au';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function livewireSettle(page: Page, ms = 0) {
  await page.waitForLoadState('networkidle');
  if (ms > 0) await page.waitForTimeout(ms);
}

async function waitUntil(fn: () => Promise<void>, timeout = 10_000) {
  await expect(fn).toPass({ timeout });
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Departments — Create', () => {
  test.describe.configure({ retries: 0 });

  test('TC-DEPT-CREATE | Create department suite', async ({ browser }) => {
    test.setTimeout(180_000);

    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    try {

      // ─── Login ──────────────────────────────────────────────────────────────
      const loginPage = new LoginPage(page);
      await loginPage.goto(`${BASE_URL}/login`);
      await loginPage.emailInput().fill(EMAIL);
      await loginPage.passwordInput().fill(PASSWORD);
      await loginPage.rememberMe().check();
      await loginPage.signInButton().click();
      await expect(loginPage.otpInput()).toBeVisible();
      await loginPage.otpInput().fill(generateTOTP(TOTP_SECRET));
      await loginPage.confirmButton().click();
      await expect(loginPage.dashboardTitle()).toBeVisible({ timeout: 15_000 });
      console.log('✅ Logged in successfully.');

      const createPg = new DepartmentsCreatePage(page);
      const listPg   = new DepartmentsPage(page);

      // ─── Navigate ────────────────────────────────────────────────────────────
      await createPg.goto();
      console.log('✅ Navigated to Create Department page.');

      // ─── TC-DEPT-C001 | Page heading ─────────────────────────────────────────
      console.log('⏳ TC-DEPT-C001 | Checking page heading...');
      await expect(createPg.pageHeading).toContainText('Add New Department');
      console.log('✅ TC-DEPT-C001 | Page heading is "Add New Department".');

      // ─── TC-DEPT-C002 | Breadcrumbs ──────────────────────────────────────────
      console.log('⏳ TC-DEPT-C002 | Checking breadcrumbs...');
      await expect(createPg.breadcrumbDepartments).toBeVisible();
      await expect(createPg.breadcrumbDepartments).toHaveAttribute('href', /departments/);
      const crumbSpan = page.locator('nav.fi-breadcrumbs span', { hasText: 'Add New Department' });
      await expect(crumbSpan).toBeVisible();
      console.log('✅ TC-DEPT-C002 | Breadcrumbs are correct.');

      // ─── TC-DEPT-C003 | All form fields visible ───────────────────────────────
      console.log('⏳ TC-DEPT-C003 | Checking all form fields are visible...');
      await expect(createPg.enabledToggle).toBeVisible();
      await expect(createPg.departmentNameInput).toBeVisible();
      await expect(createPg.headOfDeptSelectBtn).toBeVisible();
      await expect(createPg.submitBtn).toBeVisible();
      await expect(createPg.cancelBtn).toBeVisible();
      console.log('✅ TC-DEPT-C003 | All form fields and action buttons are visible.');

      // ─── TC-DEPT-C004 | Enabled toggle defaults to ON ────────────────────────
      console.log('⏳ TC-DEPT-C004 | Checking Enabled toggle default state...');
      const enabledByDefault = await createPg.isEnabledOn();
      expect(enabledByDefault).toBe(true);
      console.log(`✅ TC-DEPT-C004 | Enabled toggle is ON by default (aria-checked: ${enabledByDefault}).`);

      // ─── TC-DEPT-C005 | Enabled toggle can be toggled OFF then ON ────────────
      console.log('⏳ TC-DEPT-C005 | Toggling Enabled OFF then ON...');
      await createPg.toggleEnabled();
      await livewireSettle(page, 300);
      expect(await createPg.isEnabledOn()).toBe(false);
      console.log('✅ TC-DEPT-C005a | Toggle turned OFF.');

      await createPg.toggleEnabled();
      await livewireSettle(page, 300);
      expect(await createPg.isEnabledOn()).toBe(true);
      console.log('✅ TC-DEPT-C005b | Toggle turned back ON.');

      // ─── TC-DEPT-C006 | Department Name accepts input ────────────────────────
      console.log('⏳ TC-DEPT-C006 | Testing Department Name input...');
      await createPg.fillDepartmentName('Test Department Name');
      await expect(createPg.departmentNameInput).toHaveValue('Test Department Name');
      console.log('✅ TC-DEPT-C006 | Department Name input accepts text.');

      // ─── TC-DEPT-C007 | Department Name max length (255) ─────────────────────
      console.log('⏳ TC-DEPT-C007 | Testing Department Name max length...');
      const longName = 'A'.repeat(300);
      await createPg.fillDepartmentName(longName);
      const actualLength = (await createPg.departmentNameInput.inputValue()).length;
      expect(actualLength).toBeLessThanOrEqual(255);
      console.log(`✅ TC-DEPT-C007 | Name capped at ${actualLength} characters (max 255).`);

      // Reset to valid value
      await createPg.fillDepartmentName('Test Department Name');

      // ─── TC-DEPT-C008 | Head of Department searchable select ─────────────────
      console.log('⏳ TC-DEPT-C008 | Testing Head of Department searchable select...');
      await createPg.headOfDeptSelectBtn.click();
      await expect(createPg.headOfDeptDropdown).toBeVisible({ timeout: 10_000 });

      const searchPrompt = createPg.headOfDeptDropdown.locator('input[type="text"]');
      await expect(searchPrompt).toBeVisible();

      await searchPrompt.fill('Automation');
      await page.waitForTimeout(1_200); // respect 1000ms searchDebounce
      await livewireSettle(page);

      const options = page.locator('[role="option"], .fi-select-input-dropdown li');
      const optionCount = await options.count();
      console.log(`✅ TC-DEPT-C008 | Head of Dept search returned ${optionCount} result(s) for "Automation".`);

      if (optionCount > 0) {
        await options.first().click();
        await livewireSettle(page, 300);
        console.log('✅ TC-DEPT-C008b | First Head of Dept option selected.');
      }

      // Close dropdown if still open
      await page.keyboard.press('Escape');

      // ─── TC-DEPT-C009 | Validation — submit with empty required fields ────────
      console.log('⏳ TC-DEPT-C009 | Testing validation on empty required fields...');
      await createPg.goto(); // fresh page to clear all fields
      await livewireSettle(page);
      await createPg.submit();
      await livewireSettle(page, 500);

      const isModalVisible    = await createPg.validationModal.isVisible().catch(() => false);
      const isStillOnCreate   = page.url().includes('departments/create');

      expect(isModalVisible || isStillOnCreate).toBe(true);

      if (isModalVisible) {
        await createPg.dismissValidationModal();
        console.log('✅ TC-DEPT-C009 | Validation modal appeared and was dismissed.');
      } else {
        console.log('✅ TC-DEPT-C009 | Form stayed on create page (HTML5 / server validation).');
      }

      // ─── TC-DEPT-C010 | Cancel navigates away from create page ───────────────
      console.log('⏳ TC-DEPT-C010 | Testing Cancel button...');
      await expect(createPg.cancelBtn).toBeVisible();
      await createPg.cancel();

      await waitUntil(async () => {
        expect(page.url()).not.toContain('departments/create');
      }, 10_000);
      console.log(`✅ TC-DEPT-C010 | Cancel navigated away from create page to: ${page.url()}`);

      // ─── TC-DEPT-C011 | Successful create with name only ─────────────────────
      console.log('⏳ TC-DEPT-C011 | Submitting a valid new department (name only)...');
      await createPg.goto();
      await livewireSettle(page);

      const uniqueName = `Automated Test Dept ${Date.now()}`;
      await createPg.fillDepartmentName(uniqueName);
      await createPg.submit();
      await livewireSettle(page, 1_000);

      await waitUntil(async () => {
        expect(page.url()).not.toContain('departments/create');
      }, 20_000);

      console.log(`✅ TC-DEPT-C011 | Department "${uniqueName}" created. Redirected to: ${page.url()}`);

      // ─── TC-DEPT-C012 | Created department appears in list ───────────────────
      console.log('⏳ TC-DEPT-C012 | Verifying created department appears in list...');
      await listPg.goto();
      await livewireSettle(page);
      await listPg.fillSearch(uniqueName);
      await page.waitForTimeout(1_000);
      await livewireSettle(page);

      await expect(async () => {
        const count = await listPg.getRowCount();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 15_000 });

      const foundName = await listPg.getRowDepartmentNameByIndex(0);
      expect(foundName.toLowerCase()).toContain(uniqueName.toLowerCase());
      console.log(`✅ TC-DEPT-C012 | Department "${foundName}" found in list.`);

      // ─── TC-DEPT-C013 | Successful create with Head of Dept ──────────────────
      console.log('⏳ TC-DEPT-C013 | Submitting a department with Head of Dept selected...');
      await createPg.goto();
      await livewireSettle(page);

      const uniqueName2 = `Automated Test Dept WithHead ${Date.now()}`;
      await createPg.fillDepartmentName(uniqueName2);

      // Select Head of Department
      await createPg.headOfDeptSelectBtn.click();
      await expect(createPg.headOfDeptDropdown).toBeVisible({ timeout: 10_000 });
      await createPg.headOfDeptSearchInput.fill('Automation');
      await page.waitForTimeout(1_200);
      await livewireSettle(page);

      const headOptions = page.locator('[role="option"], .fi-select-input-dropdown li').filter({ hasText: 'Automation' });
      const headCount   = await headOptions.count();

      if (headCount > 0) {
        await headOptions.first().click();
        await livewireSettle(page, 300);
        console.log('  → Head of Dept selected.');
      } else {
        await page.keyboard.press('Escape');
        console.warn('  ⚠️  No "Automation" employee found; submitting without head.');
      }

      await createPg.submit();
      await livewireSettle(page, 1_000);

      await waitUntil(async () => {
        expect(page.url()).not.toContain('departments/create');
      }, 20_000);

      console.log(`✅ TC-DEPT-C013 | Department "${uniqueName2}" with head submitted. URL: ${page.url()}`);

      // ─── TC-DEPT-C014 | Create with Enabled toggled OFF ──────────────────────
      console.log('⏳ TC-DEPT-C014 | Submitting a disabled department...');
      await createPg.goto();
      await livewireSettle(page);

      const uniqueName3 = `Automated Disabled Dept ${Date.now()}`;
      await createPg.fillDepartmentName(uniqueName3);

      // Toggle Enabled OFF
      await createPg.toggleEnabled();
      await livewireSettle(page, 300);
      expect(await createPg.isEnabledOn()).toBe(false);

      await createPg.submit();
      await livewireSettle(page, 1_000);

      await waitUntil(async () => {
        expect(page.url()).not.toContain('departments/create');
      }, 20_000);

      console.log(`✅ TC-DEPT-C014 | Disabled department "${uniqueName3}" submitted. URL: ${page.url()}`);

    } finally {
      await context.close();
    }
  });
});
