import assert from 'node:assert/strict';
import content from './extension/content.js';
const { prefix, state, OURS } = content;

// our own prefix is recognised, including the bare one we emit when the page title is empty
assert.equal('PR 12 · Fix it'.replace(OURS, ''), 'Fix it');
assert.equal('IS 1'.replace(OURS, ''), '');
assert.equal('PR 123abc'.replace(OURS, ''), 'PR 123abc');

assert.equal(prefix('/octo/repo/pull/1234'), 'PR 1234');
assert.equal(prefix('/octo/repo/pull/1234/files'), 'PR 1234');
assert.equal(prefix('/octo/repo/issues/5678'), 'IS 5678');
assert.equal(prefix('/group/sub/project/-/merge_requests/42'), 'MR 42');
assert.equal(prefix('/group/project/-/merge_requests/42/diffs'), 'MR 42');
assert.equal(prefix('/group/project/-/issues/7'), 'IS 7');
assert.equal(prefix('/group/project/-/work_items/7'), 'IS 7');
assert.equal(prefix('/octo/repo/pulls'), null);
assert.equal(prefix('/octo/repo/issues'), null);
assert.equal(prefix('/octo/repo/issues/new'), null);
assert.equal(prefix('/octo/repo'), null);

// GitHub data-status values
assert.equal(state('PR', 'pullOpened', 'x'), 'open');
assert.equal(state('PR', 'draft', 'x'), 'draft');
assert.equal(state('PR', 'pullMerged', 'x'), 'merged');
assert.equal(state('PR', 'pullClosed', 'x'), 'closed');
assert.equal(state('IS', 'issueOpened', 'x'), 'open');
assert.equal(state('IS', 'issueClosed', 'x'), 'done');
assert.equal(state('IS', 'issueClosedNotPlanned', 'x'), 'notplanned');
// GitLab badge text; drafts only show in the title
assert.equal(state('MR', 'Open', 'Draft: Bump deps'), 'draft');
assert.equal(state('MR', 'Open', 'Bump deps'), 'open');
assert.equal(state('MR', 'Merged', 'Draft: Bump deps'), 'merged');
assert.equal(state('MR', 'Closed', 'x'), 'closed');
assert.equal(state('IS', 'Closed', 'x'), 'done');
assert.equal(state('IS', '', 'x'), ''); // badge not rendered yet
console.log('ok');
