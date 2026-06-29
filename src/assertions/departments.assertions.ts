import { expect } from '@playwright/test';
import { DepartmentsListPage } from '../pages/departments/DepartmentsListPage';

/** Reusable assertions for the Departments list — composable across specs. */
export async function expectOnDepartmentsPage(p: DepartmentsListPage): Promise<void> {
  await expect(p.heading).toHaveText('Departments');
}

export async function expectDepartmentsLanding(p: DepartmentsListPage): Promise<void> {
  await expectOnDepartmentsPage(p);
  await expect(p.breadcrumbItems).toHaveCount(2);
  await expect(p.addNewButton).toBeVisible();
  await expect(p.table.search).toBeVisible();
  await expect(p.filters.trigger.first()).toBeVisible();
}

export async function expectTableHeaders(p: DepartmentsListPage): Promise<void> {
  await expect(p.table.header('name')).toBeVisible();
  await expect(p.table.header('head-employee\\.name')).toBeVisible();
  await expect(p.table.header('is-enabled')).toBeVisible();
}
