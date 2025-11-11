import { test, before, after } from 'node:test';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, HttpMethod } from '@sectester/scan';

const timeout = 40 * 60 * 1000;
const baseUrl = process.env.BRIGHT_TARGET_URL!;

let runner!: SecRunner;

before(async () => {
  runner = new SecRunner({
    hostname: process.env.BRIGHT_HOSTNAME!,
    projectId: process.env.BRIGHT_PROJECT_ID!
  });

  await runner.init();
});

after(() => runner.clear());

test('PUT /users/1', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['csrf', 'bopla', 'sqli', 'xss', 'id_enumeration', 'osi'],
      attackParamLocations: [AttackParamLocation.BODY],
      starMetadata: {
        code_source: 'tssbox/ruby-example-app:master',
        databases: ['PostgreSQL'],
        user_roles: ['admin']
      }
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.PUT,
      url: `${baseUrl}/users/1`,
      body: {
        user: {
          email: 'user@example.com',
          password: 'securePassword123',
          password_digest: '$2a$12$KIXQ1Y1l1F1',
          admin: false
        }
      },
      headers: { 'Content-Type': 'application/json' }
    });
});