import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../core/BasePage';
import { routes } from '../../config/routes';

/** Push Notifications create form. */
export class PushNotificationFormPage extends BasePage {
  readonly titleInput: Locator;
  readonly bodyTextarea: Locator;
  readonly sendToAllToggle: Locator;
  readonly imageUpload: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.locator('input#form\\.title');
    this.bodyTextarea = page.locator('textarea#form\\.body');
    this.sendToAllToggle = page.locator('button#form\\.send_to_all');
    this.imageUpload = page.locator('.fi-fo-file-upload');
    this.submitButton = page.getByRole('button', { name: /send push notification/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
  }

  goto(): Promise<void> {
    return this.open(routes.pushNotifications.create, this.titleInput);
  }

  fillTitle(text: string): Promise<void> {
    return this.titleInput.fill(text);
  }

  fillBody(text: string): Promise<void> {
    return this.bodyTextarea.fill(text);
  }

  toggleSendToAll(): Promise<void> {
    return this.sendToAllToggle.click();
  }

  submit(): Promise<void> {
    return this.submitButton.click();
  }
}
