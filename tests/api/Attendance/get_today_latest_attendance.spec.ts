import { testAuthedGetEndpoint } from '../_shared';

testAuthedGetEndpoint("Get today's latest attendance", '/api/attendances/today/latest');
