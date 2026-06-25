import { test } from '@playwright/test';
import { requireToken } from './_shared';

test('Print token for debugging', async () => {
  const token = requireToken();

  console.log('Full token:', token);

  console.log(
    'Masked token:',
    `${token.substring(0, 8)}...${token.substring(token.length - 6)}`
  );
});