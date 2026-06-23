import { testAuthedGetEndpoint } from '../_shared';

testAuthedGetEndpoint("Get today's rosters", '/api/attendances/roster');
