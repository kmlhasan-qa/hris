import { testAuthedGetEndpoint } from './_shared';

testAuthedGetEndpoint("Get today's attendance", '/api/attendances/today');
