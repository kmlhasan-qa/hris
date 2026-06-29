import { test } from '../../../src/core/fixtures';
import { expectDepartmentsLanding } from '../../../src/assertions/departments.assertions';

test.describe('Departments - Page Smoke', () => {
  test('loads the departments page with its core controls', async ({ departments }) => {
    await departments.goto();
    await expectDepartmentsLanding(departments);
  });
});
