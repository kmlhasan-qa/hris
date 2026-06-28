import { Page, Locator } from '@playwright/test';

export class PushNotificationsCreatePage {
  readonly page: Page;

  readonly titleInput: Locator;
  readonly sendToAllBtn: Locator;
  readonly departmentSelect: Locator;
  readonly siteSelect: Locator;
  readonly bodyTextarea: Locator;
  readonly imageUpload: Locator;
  readonly submitBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.titleInput = page.locator('input#form\\.title');
    this.sendToAllBtn = page.locator('button#form\\.send_to_all');
    this.departmentSelect = page.locator('select#form\\.department');
    this.siteSelect = page.locator('select#form\\.site');
    this.bodyTextarea = page.locator('textarea#form\\.body');
    this.imageUpload = page.locator('.fi-fo-file-upload');

    this.submitBtn = page.getByRole('button', {
      name: /send push notification/i,
    });

    this.cancelBtn = page.getByRole('button', {
      name: /cancel/i,
    });
  }

  async fillTitle(text: string) {
    await this.titleInput.fill(text);
  }

  async fillBody(text: string) {
    await this.bodyTextarea.fill(text);
  }

  async toggleSendToAll() {
    await this.sendToAllBtn.click();
  }

  async submit() {
    await this.submitBtn.click();
  }
}