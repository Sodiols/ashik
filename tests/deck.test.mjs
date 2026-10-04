import test from "node:test";
import assert from "node:assert/strict";
import { exitFor, planeFor, swipeDirection, visiblePlanes } from "../lib/deck.ts";

test("front and rear planes step diagonally up and right", () => {
  assert.deepEqual(planeFor(0, "stage"), { xPercent: 0, yPercent: 0, autoAlpha: 1, zIndex: 10 });
  const rear = planeFor(2, "stage");
  assert.ok(rear.xPercent > 0 && rear.yPercent < 0);
  assert.equal(rear.zIndex, 8);
});

test("compact decks use smaller offsets than the spatial stage", () => {
  assert.ok(planeFor(1, "compact").xPercent < planeFor(1, "stage").xPercent);
  assert.ok(Math.abs(planeFor(1, "compact").yPercent) < Math.abs(planeFor(1, "stage").yPercent));
  assert.ok(exitFor("compact").yPercent > exitFor("stage").yPercent);
});

test("only the front and the visible rear planes are shown", () => {
  assert.equal(planeFor(-1, "stage").autoAlpha, 0);
  assert.equal(planeFor(visiblePlanes - 1, "stage").autoAlpha, 1);
  assert.equal(planeFor(visiblePlanes, "stage").autoAlpha, 0);
  // Hidden planes park at the last visible depth instead of flying away.
  assert.deepEqual(
    [planeFor(9, "stage").xPercent, planeFor(9, "stage").yPercent],
    [planeFor(visiblePlanes, "stage").xPercent, planeFor(visiblePlanes, "stage").yPercent],
  );
});

test("swipes need a clearly horizontal gesture", () => {
  assert.equal(swipeDirection(-80, 10), 1);
  assert.equal(swipeDirection(80, 10), -1);
  assert.equal(swipeDirection(30, 0), 0, "below threshold");
  assert.equal(swipeDirection(-80, 75), 0, "diagonal stays with the page");
  assert.equal(swipeDirection(-10, -200), 0, "vertical scroll");
});
