import { test, expect } from "vitest";
import { sleep } from "./sleep";

test("指定した時間だけ処理を待つ", async () => {
	const startTime = performance.now();

	await sleep(100);

	const endTime = performance.now();
	const spendTime = endTime - startTime;

	expect(spendTime).toBeGreaterThan(100);
});
