import { useI18n } from "../i18n/I18nContext";
import { isCaptchaEnabled } from "./TurnstileWidget";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
const UPDATED = "23 September 2026";

function Contact() {
  if (!CONTACT_EMAIL) return null;
  return (
    <p>
      Questions, or want your data deleted by us? Email{" "}
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
    </p>
  );
}

function Privacy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="legal__updated">Last updated: {UPDATED}</p>
      <p>
        Code Quest is a learn-to-code game. This page explains, in plain language, what
        information it handles. If you are under 13, please read this with a parent or guardian.
      </p>

      <h2>Playing as a guest</h2>
      <p>
        Guest mode needs no account. Your progress, settings and language are saved only in your
        own browser on your own device, and are never sent to us. Clearing your browser data
        removes them.
      </p>

      <h2>If you create an account</h2>
      <p>We store:</p>
      <ul>
        <li>your email address and display name;</li>
        <li>
          your password, only in scrambled (hashed) form by our sign-in provider — we never see or
          can read it;
        </li>
        <li>
          your game progress: lessons completed, ranked points and stats, streaks, avatars,
          characters, theme and language choices.
        </li>
      </ul>
      <p>We use this only to run your account and sync your progress between your devices.</p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not show ads or sell or rent your information.</li>
        <li>We do not use advertising trackers or third-party analytics.</li>
        <li>
          JavaScript and Python code you type into lessons runs in your own browser and is not
          uploaded anywhere.
        </li>
        <li>
          <strong>C, C++ and Java are different:</strong> they cannot run inside a browser, so when
          you press Run in those lessons, your code is sent to a free online compiler (Wandbox,
          wandbox.org, run by a third party), which runs it and sends the result back. We do not
          keep that code, but Wandbox has its own policies. Please never put personal information
          in your code.
        </li>
        <li>
          <strong>Side quest lessons on REST APIs and GraphQL</strong> send real requests, from your
          browser, to free public test APIs (jsonplaceholder.typicode.com and
          countries.trevorblades.com) so you can practice against a genuine server. These only
          receive whatever request the lesson sends — never your account details.
        </li>
      </ul>

      <h2>Services that help us run the app</h2>
      <ul>
        <li>
          <strong>Supabase</strong> — sign-in and the database that holds account details and
          progress.
        </li>
        <li>
          <strong>Vercel</strong> — hosts the website. Like any web host, it sees your IP address
          and basic request details in server logs.
        </li>
        {isCaptchaEnabled && (
          <li>
            <strong>Cloudflare Turnstile</strong> — a bot check shown on the sign-up and log-in
            forms. It receives your IP address and basic browser details to tell people from bots.
          </li>
        )}
        <li>
          <strong>Wandbox</strong> — only if you use C, C++ or Java lessons: it receives the code
          you run, and your IP address, to compile and run it.
        </li>
        <li>
          <strong>JSONPlaceholder and the Countries GraphQL API</strong> — only if you use the REST
          APIs or GraphQL side quests: these free public test services receive the practice
          requests those lessons send, and your IP address.
        </li>
        <li>
          <strong>Google Fonts</strong> — the app’s fonts are loaded from Google, which therefore
          receives your IP address when the page loads.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        Code Quest is made for young learners. Children under 13 should use guest mode, or have a
        parent or guardian set up an account for them, because an account stores an email address.
        We do not knowingly collect personal information from a child under 13 without a
        parent’s involvement. If you believe a child has created an account without permission,
        contact us and we will delete it.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          <strong>Delete your account:</strong> Settings → Account → Delete my account. This
          permanently removes your email, display name and saved progress.
        </li>
        <li>
          <strong>Forgot your password:</strong> use “Forgot password?” on the log-in screen.
        </li>
        <li>
          <strong>Guest data:</strong> clear your browser’s site data for this website.
        </li>
      </ul>

      <h2>How long we keep data</h2>
      <p>Account data is kept until you delete your account.</p>

      <h2>Security</h2>
      <p>
        Connections use HTTPS, and the database is set up so each account can read only its own
        data. No online service can promise perfect security, but we take care to protect what we
        hold.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes, we will update the date above.</p>
      <Contact />
    </>
  );
}

function Terms() {
  return (
    <>
      <h1>Terms of Use</h1>
      <p className="legal__updated">Last updated: {UPDATED}</p>
      <p>By using Code Quest you agree to these terms. If you are under 13, ask a parent or guardian first.</p>

      <h2>Using Code Quest</h2>
      <p>
        Code Quest is an educational game for learning to code. You may use it for free for
        personal, non-commercial learning. Please be kind: don’t try to break, overload or gain
        unauthorised access to the app or other people’s accounts, and don’t use it for anything
        unlawful.
      </p>

      <h2>Your account</h2>
      <p>
        Keep your password private and give accurate details. You are responsible for activity on
        your account. You can delete your account at any time in Settings.
      </p>

      <h2>Your code</h2>
      <p>
        JavaScript and Python code you write in lessons runs in your own browser. C, C++ and Java
        code is sent to a third-party online compiler when you press Run, and REST API/GraphQL
        lessons send real requests to third-party public test APIs — so don’t include personal
        information in code you run. Only run code you understand; we are not responsible for what
        code you choose to run, or for the availability of those third-party services.
      </p>

      <h2>Learning content</h2>
      <p>
        Lessons and quizzes are written to be helpful, but they may contain mistakes and are not
        professional advice. Check important facts against official documentation.
      </p>

      <h2>Ranked points and rewards</h2>
      <p>
        Ranked points, ranks, streaks and unlockables are for fun only and have no monetary value.
        We may adjust game balance or reset ranked data as the game develops.
      </p>

      <h2>Availability and changes</h2>
      <p>
        Code Quest is provided “as is”, without promises that it will always be available or free
        of errors. To the extent the law allows, we are not liable for losses arising from its use.
        We may change or discontinue features, and may suspend accounts that break these terms.
      </p>

      <h2>Privacy</h2>
      <p>
        See our <a href="#/privacy">Privacy Policy</a> for how information is handled.
      </p>

      <h2>Changes to these terms</h2>
      <p>If these terms change, we will update the date above. Continued use means you accept the changes.</p>
      <Contact />
    </>
  );
}

export default function LegalPage({ page }) {
  const { t } = useI18n();

  return (
    <div className="legal">
      <a className="back-link" href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}>
        ← {t("legal.back")}
      </a>
      <article className="legal__body">{page === "terms" ? <Terms /> : <Privacy />}</article>
      <p className="legal__switch">
        {page === "terms" ? (
          <a href="#/privacy">{t("legal.privacy")}</a>
        ) : (
          <a href="#/terms">{t("legal.terms")}</a>
        )}
      </p>
    </div>
  );
}
