import { test, expect } from "@playwright/test";

// Runs every morning against the live site (daily-health.yml). Uses only
// what any visitor can see — the public page and the public Supabase anon
// key inside it — so it needs no secrets.

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    const text = msg.text();
    if ((msg.type() === "error" || /Content Security Policy/i.test(text)) && !/Failed to load resource|net::ERR_/i.test(text)) {
      errors.push(`console: ${text}`);
    }
  });
  return errors;
}

async function enterAsGuest(page, language) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate((language) => {
    localStorage.setItem("codequest-progress", JSON.stringify({
      onboardingComplete: true,
      onboardingAnswers: { experience: "beginner", goal: "fun", language },
      language, selectedCharacter: "pixel", isGuest: true, worldsState: {},
    }));
    localStorage.setItem("codequest-guest", "true");
    localStorage.setItem("codequest-seen-intros", JSON.stringify(["Say Hello"]));
  }, language);
  await page.reload({ waitUntil: "networkidle" });
}

async function passFirstLesson(page, code) {
  await page.goto("/#/learn/w/1/l/1-1", { waitUntil: "networkidle" });
  const editor = page.locator("textarea").first();
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Meta+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(code);
  await page.getByRole("button", { name: /run code/i }).first().click();
  await expect(page.getByText(/Hello, World!/).last()).toBeVisible({ timeout: 45000 });
  await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
}

// The Supabase project URL and public anon key, read from the live bundle.
async function supabaseFromBundle(request) {
  const html = await (await request.get("/")).text();
  const entry = html.match(/\/assets\/index-[^"]+\.js/)?.[0];
  expect(entry, "main script in index.html").toBeTruthy();
  const js = await (await request.get(entry)).text();
  const url = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
  const key = js.match(/eyJ[\w-]{10,}\.eyJ[\w-]+\.[\w-]+/)?.[0];
  expect(url, "Supabase URL in bundle").toBeTruthy();
  expect(key, "Supabase anon key in bundle").toBeTruthy();
  const role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role;
  expect(role, "only the public anon key may ship in the page").toBe("anon");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

test("site is up with its security headers", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect((await request.get("/learn")).status(), "unknown paths open the app").toBe(200);
});

test("no secrets or source files are served", async ({ request }) => {
  for (const path of ["/.env", "/.env.local", "/.git/config", "/package.json", "/supabase/schema.sql"]) {
    const res = await request.get(path);
    const body = await res.text();
    expect(body, `${path} must not be served`).not.toMatch(/VITE_|\[core\]|"dependencies"|create table/i);
  }
});

test("a JavaScript lesson runs and passes", async ({ page }) => {
  const errors = watchErrors(page);
  await enterAsGuest(page, "javascript");
  await passFirstLesson(page, 'console.log("Hello, World!");');
  expect(errors).toEqual([]);
});

test("a Python lesson runs and passes (Pyodide loads)", async ({ page }) => {
  const errors = watchErrors(page);
  await enterAsGuest(page, "python");
  await passFirstLesson(page, 'print("Hello, World!")');
  expect(errors).toEqual([]);
});

test("the database blocks visitors who aren't signed in", async ({ request }) => {
  const { url, headers } = await supabaseFromBundle(request);
  for (const table of ["profiles", "progress", "ranked_stats", "ranked_queue", "ranked_matches"]) {
    const res = await request.get(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
    expect(res.ok(), `${table} reachable`).toBeTruthy();
    expect(await res.json(), `${table} must hide every row`).toEqual([]);
  }
  const usage = await request.get(`${url}/rest/v1/code_help_usage?select=*&limit=1`, { headers });
  expect(usage.ok(), "code_help_usage must refuse visitors").toBeFalsy();
  const write = await request.post(`${url}/rest/v1/progress`, {
    headers, data: { user_id: "00000000-0000-0000-0000-000000000001", data: {} },
  });
  expect(write.ok(), "visitors can't write progress").toBeFalsy();
  for (const fn of ["delete_my_account", "save_match_questions", "try_ranked_match"]) {
    const res = await request.post(`${url}/rest/v1/rpc/${fn}`, { headers, data: {} });
    expect(res.ok(), `${fn} must refuse visitors`).toBeFalsy();
  }
});

test("AI Edge Functions are up and only answer this site", async ({ request, baseURL }) => {
  const { url } = await supabaseFromBundle(request);
  for (const fn of ["code-help", "generate-ranked-questions"]) {
    const res = await request.fetch(`${url}/functions/v1/${fn}`, {
      method: "OPTIONS", headers: { Origin: "https://example.com" },
    });
    expect(res.status(), `${fn} is deployed`).toBeLessThan(300);
    expect(res.headers()["access-control-allow-origin"], `${fn} CORS`).toBe(new URL(baseURL).origin);
  }
});
