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

test('POST /login', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['csrf', 'sqli', 'xss', 'html_injection', 'email_injection', 'unvalidated_redirect'],
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
      method: HttpMethod.POST,
      url: `${baseUrl}/login`,
      body: {
        email: 'user@example.com',
        password: 'securepassword'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
});