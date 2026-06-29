import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../core/BasePage';
import { FilamentTable } from '../../core/filament/FilamentTable';
import { FilamentFilters } from '../../core/filament/FilamentFilters';
import { routes } from '../../config/routes';

/**
 * Departments list page. Locators + actions only — assertions live in
 * `src/assertions/departments.assertions.ts`. Table/filter mechanics are
 * delegated to the shared Filament components.
 */
export class DepartmentsListPage extends BasePage {
  readonly table = new FilamentTable(this.page);
  readonly filters = new FilamentFilters(this.page);

  readonly heading: Locator;
  readonly breadcrumbItems: Locator;
  readonly addNewButton: Locator;

  // Departments-specific filter selects (panel mechanics handled by `filters`).
  readonly filterHeadOfDeptSelect: Locator;
  readonly filterStatusSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Departments' });
    this.breadcrumbItems = page.locator('ol.fi-breadcrumbs-list li');
    this.addNewButton = page.getByRole('link', { name: 'Add New Department' });

    this.filterHeadOfDeptSelect = page.locator(
      '[wire\\:key*="tableFiltersForm.headEmployee.values"] .fi-select-input-btn',
    );
    this.filterStatusSelect = page.locator(
      '[wire\\:key*="tableFiltersForm.is_enabled.value"] .fi-select-input-btn',
    );
  }

  goto(): Promise<void> {
    return this.open(routes.departments.list, this.table.search);
  }

  // ── Column accessors (semantic names over raw Filament keys) ────────────────
  departmentName(row: number): Promise<string> {
    return this.table.cellText(row, 'name');
  }

  headOfDept(row: number): Promise<string> {
    return this.table.cellText(row, 'head-employee\\.name');
  }

  enabledIcon(row: number): Locator {
    return this.table.cell(row, 'is-enabled').locator('svg');
  }

  async openDepartment(row: number): Promise<void> {
    await this.table.cell(row, 'name').locator('a').first().click();
  }

  // ── Filter actions ──────────────────────────────────────────────────────────
  async selectHeadOfDeptFilter(employeeName: string): Promise<void> {
    await this.filters.chooseOption(this.filterHeadOfDeptSelect, employeeName);
  }

  async selectStatusFilter(status: 'Enabled' | 'Disabled'): Promise<void> {
    await this.filters.chooseOption(this.filterStatusSelect, status);
  }
}
