import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPublicCatalog, resolveModel } from '../src/config/models.js';

test('public catalog hides provider info', () => {
  const catalog = getPublicCatalog();
  assert.ok(Array.isArray(catalog.plans));
  assert.equal(catalog.plans.length, 2);

  const names = catalog.plans.map((p) => p.name);
  assert.deepEqual(names, ['Study Sphere Lite', 'Study Sphere Pro']);

  for (const plan of catalog.plans) {
    for (const model of plan.models) {
      assert.ok(model.id);
      assert.ok(model.name);
      assert.equal(model.provider, undefined);
      assert.equal(model.upstreamModel, undefined);
    }
  }
});

test('resolveModel returns internal routing record', () => {
  const resolved = resolveModel('pro-mentor');
  assert.ok(resolved);
  assert.equal(resolved.tier, 'pro');
  assert.ok(resolved.upstreamModel);
});

test('resolveModel returns null for unknown model', () => {
  assert.equal(resolveModel('does-not-exist'), null);
});
