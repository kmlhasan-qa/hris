import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../core/BasePage';
import { waitForLivewire } from '../../core/filament/livewire';
import { routes } from '../../config/routes';

/** Departments create/edit form. */
export class DepartmentFormPage extends BasePage {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly enabledToggle: Locator;
  readonly headOfDeptSelectBtn: Locator;
  readonly headOfDeptDropdown: Locator;
  readonly headOfDeptSearchInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;
  readonly deleteConfirmForm: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading').first();
    this.nameInput = page.locator('input#form\\.name');
    this.enabledToggle = page.locator('button#form\\.is_enabled');
    this.headOfDeptSelectBtn = page.locator('.fi-select-input-btn').first();
    this.headOfDeptDropdown = page.locator('.fi-dropdown-panel[role="listbox"]');
    this.headOfDeptSearchInput = this.headOfDeptDropdown.locator('input[type="text"]');
    this.submitButton = page.getByRole('button', { name: /submit/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.deleteButton = page.locator(`button[wire\\:click*="mountAction('delete'"]`);
    this.deleteConfirmForm = page.locator(`form[wire\\:submit\\.prevent="callMountedAction"]`);
    this.confirmDeleteButton = this.deleteConfirmForm.locator('button[type="submit"]');
  }

  gotoCreate(): Promise<void> {
    return this.open(routes.departments.create, this.nameInput);
  }

  gotoEdit(id: string | number): Promise<void> {
    return this.open(routes.departments.edit(id), this.nameInput);
  }

  fillName(name: string): Promise<void> {
    return this.nameInput.fill(name);
  }

  /** Open the head-of-department combobox, search, and pick the option. */
  async selectHeadOfDept(name: string): Promise<void> {
    await this.headOfDeptSelectBtn.click();
    await expect(this.headOfDeptDropdown).toBeVisible();

    // Searching is debounced + server-side; wait on the Livewire round-trip
    // rather than sleeping, then on the option becoming visible.
    await waitForLivewire(this.page, () => this.headOfDeptSearchInput.fill(name));

    const option = this.page
      .locator('[role="option"], .fi-select-input-dropdown li')
      .filter({ hasText: name })
      .first();
    await expect(option).toBeVisible();
    await option.click();
  }

  submit(): Promise<void> {
    return this.submitButton.click();
  }

  cancel(): Promise<void> {
    return this.cancelButton.click();
  }

  /** Read the enabled toggle state, tolerant of aria vs. class-based markup. */
  async isEnabledOn(): Promise<boolean> {
    const checked = await this.enabledToggle.getAttribute('aria-checked');
    if (checked !== null) return checked === 'true';
    const className = (await this.enabledToggle.getAttribute('class')) ?? '';
    return className.includes('fi-color-success');
  }

  /** Delete from the edit page and wait for the redirect back to the list. */
  async deleteDepartment(): Promise<void> {
    await expect(this.deleteButton).toBeVisible();
    await this.deleteButton.click();

    await expect(this.deleteConfirmForm).toBeVisible();
    await expect(this.confirmDeleteButton).toBeVisible();

    await Promise.all([
      this.page.waitForURL(/\/admin\/departments(\/?|\?.*)$/, { timeout: 30_000 }),
      this.confirmDeleteButton.click(),
    ]);
  }
}
