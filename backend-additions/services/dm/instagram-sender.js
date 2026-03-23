/**
 * Instagram DM sender using Playwright.
 *
 * Unlike the v1 approach (one shared persistent profile directory), this
 * version accepts per-account cookie arrays so multiple Instagram accounts
 * can be managed independently.  Cookies are stored AES-256 encrypted in
 * the database; the caller decrypts them before passing here.
 *
 * Flow per send:
 *   1. Launch a *temporary* browser context (no on-disk profile).
 *   2. Inject the decrypted cookies so Instagram treats the session as logged in.
 *   3. Navigate to the inbox, compose a new DM, send it.
 *   4. Close the context (nothing persisted to disk).
 *
 * Environment variables:
 *   PLAYWRIGHT_HEADLESS   — "false" to watch locally (default: true)
 *   COOKIE_ENCRYPTION_KEY — 32-byte hex key used by encryptCookies / decryptCookies
 */

const { chromium } = require('playwright');
const crypto = require('crypto');

const HEADLESS = process.env.PLAYWRIGHT_HEADLESS !== 'false';
const ENC_KEY  = process.env.COOKIE_ENCRYPTION_KEY || '';
const ALGO     = 'aes-256-cbc';
const IV_LEN   = 16;

// ─── Cookie encryption helpers ────────────────────────────────────────────────

/**
 * Encrypt a plain JSON string (the cookie array) for storage.
 * @param {string} plaintext
 * @returns {string}  "iv_hex:ciphertext_hex"
 */
function encryptCookies(plaintext) {
  if (!ENC_KEY) throw new Error('COOKIE_ENCRYPTION_KEY is not set');
  const key = Buffer.from(ENC_KEY, 'hex');
  const iv  = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt the stored cookie string back to a plain JSON string.
 * @param {string} stored  "iv_hex:ciphertext_hex"
 * @returns {string}
 */
function decryptCookies(stored) {
  if (!ENC_KEY) throw new Error('COOKIE_ENCRYPTION_KEY is not set');
  const [ivHex, ctHex] = stored.split(':');
  const key = Buffer.from(ENC_KEY, 'hex');
  const iv  = Buffer.from(ivHex, 'hex');
  const ct  = Buffer.from(ctHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

// ─── Instagram UI selectors ────────────────────────────────────────────────────
// Update these if Instagram changes its DOM structure.
const SEL = {
  newDmButton:  'a[href="/direct/new/"]',
  searchInput:  'input[placeholder="Search"]',
  firstResult:  'div[role="listbox"] div[role="option"]:first-child',
  nextButton:   'div[role="button"]:has-text("Next")',
  messageInput: 'textarea[placeholder="Message..."], div[contenteditable="true"][role="textbox"]',
  sendButton:   'div[role="button"]:has-text("Send")',
  errorBanner:  '[data-testid="ig-error-banner"], div[class*="error"]',
  notNowBtn:    'button:has-text("Not Now")',
};

// ─── Main send function ────────────────────────────────────────────────────────

/**
 * Send a single Instagram DM.
 *
 * @param {object} params
 * @param {string}   params.handle          — Instagram username, no @
 * @param {string}   params.message         — Text to send
 * @param {string}   params.encryptedCookies — AES-encrypted cookie blob from DB
 * @returns {Promise<{ success: boolean, error?: string, durationMs: number }>}
 */
async function sendInstagramDm({ handle, message, encryptedCookies }) {
  const start = Date.now();
  let context;

  try {
    // ── 1. Decrypt cookies ────────────────────────────────────────────────────
    let cookies;
    try {
      const plain = decryptCookies(encryptedCookies);
      cookies = JSON.parse(plain);
    } catch (e) {
      return { success: false, error: `Cookie decrypt failed: ${e.message}`, durationMs: Date.now() - start };
    }

    if (!Array.isArray(cookies) || cookies.length === 0) {
      return { success: false, error: 'No cookies provided for this account', durationMs: Date.now() - start };
    }

    // ── 2. Launch ephemeral browser context ───────────────────────────────────
    const browser = await chromium.launch({
      headless: HEADLESS,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    });

    context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/122.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });

    // Inject the stored session cookies
    await context.addCookies(cookies);

    const page = await context.newPage();

    // ── 3. Navigate to inbox ──────────────────────────────────────────────────
    await page.goto('https://www.instagram.com/direct/inbox/', {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });

    // Guard: if redirected to login, cookies are expired
    if (page.url().includes('/accounts/login')) {
      return { success: false, error: 'Session expired — account needs re-authentication', durationMs: Date.now() - start };
    }

    // Dismiss "Turn on Notifications" modal if present
    const notNow = page.locator(SEL.notNowBtn);
    if (await notNow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await notNow.click();
      await randomDelay(400, 700);
    }

    // ── 4. Open new DM compose ────────────────────────────────────────────────
    await page.locator(SEL.newDmButton).click({ timeout: 10_000 });

    // ── 5. Search for target ──────────────────────────────────────────────────
    const searchBox = page.locator(SEL.searchInput);
    await searchBox.waitFor({ state: 'visible', timeout: 10_000 });
    await humanType(searchBox, handle);
    await page.waitForSelector(SEL.firstResult, { timeout: 10_000 });

    const firstOption = page.locator(SEL.firstResult).first();
    const suggestedText = (await firstOption.innerText().catch(() => '')).toLowerCase();

    if (!suggestedText.includes(handle.toLowerCase())) {
      return {
        success: false,
        error: `@${handle} not found in search results (got: "${suggestedText.slice(0, 60)}")`,
        durationMs: Date.now() - start,
      };
    }

    await firstOption.click();
    await randomDelay(500, 1000);

    // ── 6. Advance to compose view ────────────────────────────────────────────
    const nextBtn = page.locator(SEL.nextButton);
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn.click();
      await randomDelay(800, 1500);
    }

    // ── 7. Type message ───────────────────────────────────────────────────────
    const msgBox = page.locator(SEL.messageInput).first();
    await msgBox.waitFor({ state: 'visible', timeout: 10_000 });
    await humanType(msgBox, message);
    await randomDelay(400, 800);

    // ── 8. Send ───────────────────────────────────────────────────────────────
    const sendBtn = page.locator(SEL.sendButton);
    if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendBtn.click();
    } else {
      await msgBox.press('Enter');
    }

    await randomDelay(1200, 2200);

    // ── 9. Check for error banners ────────────────────────────────────────────
    const errBanner = page.locator(SEL.errorBanner);
    if (await errBanner.isVisible({ timeout: 3000 }).catch(() => false)) {
      const errText = await errBanner.innerText().catch(() => 'Unknown Instagram error');
      return { success: false, error: errText.slice(0, 300), durationMs: Date.now() - start };
    }

    console.log(`[InstagramSender] Sent DM to @${handle} (${Date.now() - start}ms)`);
    return { success: true, durationMs: Date.now() - start };

  } catch (err) {
    console.error(`[InstagramSender] Error sending to @${handle}:`, err.message);
    return { success: false, error: err.message, durationMs: Date.now() - start };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function humanType(locator, text) {
  for (const char of text) {
    await locator.press(char);
    await randomDelay(40, 130);
  }
}

function randomDelay(minMs, maxMs) {
  const ms = minMs + Math.floor(Math.random() * (maxMs - minMs));
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { sendInstagramDm, encryptCookies, decryptCookies };
