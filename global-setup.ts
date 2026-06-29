import setupUI from './global-setup-ui';
import setupAPI from './global-setup-api';

export default async function globalSetup() {
  await setupUI();
  await setupAPI();
}