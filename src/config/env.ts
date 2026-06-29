/**
 * UI suite environment configuration.
 *
 * Re-exports the existing single source of truth in `helpers/config.ts` (which is
 * also consumed by the API suite) so there is exactly ONE place that resolves
 * credentials and base URLs. Do not hardcode URLs or credentials anywhere else.
 */
export {
  HRIS_BASE_URL,
  UI_LOGIN,
  PRIMARY_ACCOUNT,
  MAILTM,
} from '../../helpers/config';
