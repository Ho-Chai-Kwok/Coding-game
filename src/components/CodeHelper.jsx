import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../auth/AuthContext";
import CodeEditor from "./CodeEditor";
import {
  askForCodeHelp,
  buildUserTurnContent,
  CODE_HELP_QUESTION_MAX,
  CODE_HELP_CODE_MAX,
  CODE_HELP_MAX_TURNS,
} from "../utils/codeHelper";

// Settings → 🆘 Code Helper: a real, continuous chat with an AI tutor
// (supabase/functions/code-help — see its README for the one-time
// setup), capped at CODE_HELP_MAX_TURNS user turns — the same number as
// the server's daily request cap, so a full conversation and a full
// day's allowance are the same thing by design, not two separate limits
// to track. Requires an account, same reasoning as Ranked Mode: a stable
// identity is what lets the server enforce that cap on a paid API.
//
// No language picker: `defaultLanguage` (the learner's own app-wide
// choice) is used silently for the code editor's bracket-matching/indent
// behavior, and the tutor is perfectly capable of recognizing the actual
// language straight from the pasted code — asking someone to pick from a
// list before every message is friction with no real payoff.
export default function CodeHelper({ defaultLanguage = "javascript", onBack }) {
  const { t } = useI18n();
  const { isLoggedIn, signOut } = useAuth();
  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  // Each entry: { role: "user", question, code } | { role: "assistant", text } | { role: "assistant", error: reason }
  const [thread, setThread] = useState([]);
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState(null); // { usedToday, dailyLimit }

  const turnsUsed = thread.filter((m) => m.role === "user").length;
  const atLimit = usage ? usage.usedToday >= usage.dailyLimit : turnsUsed >= CODE_HELP_MAX_TURNS;
  const canSend = (question.trim() || code.trim()) && !sending && !atLimit;

  async function handleSend() {
    const userTurn = { role: "user", question, code };
    const nextThread = [...thread, userTurn];
    setThread(nextThread);
    setQuestion("");
    setCode("");
    setSending(true);

    const apiMessages = nextThread.map((m) =>
      m.role === "user"
        ? { role: "user", content: buildUserTurnContent(m) }
        : { role: "assistant", content: m.text ?? "" },
    );
    const result = await askForCodeHelp({ messages: apiMessages });
    setSending(false);

    if (result.ok) {
      setThread((prev) => [...prev, { role: "assistant", text: result.reply }]);
      setUsage({ usedToday: result.usedToday, dailyLimit: result.dailyLimit });
    } else {
      setThread((prev) => [...prev, { role: "assistant", error: result.reason }]);
      if (result.usedToday != null) setUsage({ usedToday: result.usedToday, dailyLimit: result.dailyLimit });
    }
  }

  function handleNewChat() {
    setThread([]);
    setQuestion("");
    setCode("");
  }

  if (!isLoggedIn) {
    return (
      <div className="code-helper">
        <button className="back-link" onClick={onBack}>
          ← {t("backToModes")}
        </button>
        <h1>{t("codeHelper.title")}</h1>
        <div className="code-helper__guest-gate">
          <p className="code-helper__guest-gate-text">{t("codeHelper.guestGate")}</p>
          <button className="settings__signout" onClick={signOut}>
            {t("auth.logIn")} / {t("auth.signUp")}
          </button>
        </div>
      </div>
    );
  }

  const errorText = (reason) => {
    if (reason === "not_configured") return t("codeHelper.notConfigured");
    if (reason === "rate_limited") return t("codeHelper.rateLimited");
    if (reason === "empty_request") return t("codeHelper.emptyRequest");
    if (reason === "conversation_too_long") return t("codeHelper.conversationTooLong");
    return t("codeHelper.genericError");
  };

  return (
    <div className="code-helper">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>
      <div className="code-helper__header-row">
        <div>
          <h1>{t("codeHelper.title")}</h1>
          <p className="code-helper__subtitle">{t("codeHelper.subtitle")}</p>
        </div>
        {thread.length > 0 && (
          <button className="code-helper__new-chat" onClick={handleNewChat}>
            {t("codeHelper.newChat")}
          </button>
        )}
      </div>

      {thread.length > 0 && (
        <>
          <p className="code-helper__turns">
            {turnsUsed}/{usage?.dailyLimit ?? CODE_HELP_MAX_TURNS} {t("codeHelper.turnsUsed")}
          </p>
          <div className="code-helper__thread">
            {thread.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div key={i} className="code-helper__bubble code-helper__bubble--user">
                    {m.question && <p className="code-helper__bubble-text">{m.question}</p>}
                    {m.code && (
                      <pre className="code-helper__bubble-code">
                        <code>{m.code}</code>
                      </pre>
                    )}
                  </div>
                );
              }
              if (m.error) {
                return (
                  <div key={i} className="code-helper__bubble code-helper__bubble--error">
                    <p className="code-helper__bubble-text">{errorText(m.error)}</p>
                  </div>
                );
              }
              return (
                <div key={i} className="code-helper__bubble code-helper__bubble--assistant">
                  <p className="code-helper__bubble-text">{m.text}</p>
                </div>
              );
            })}
            {sending && (
              <div className="code-helper__bubble code-helper__bubble--assistant code-helper__bubble--pending">
                <span className="code-helper__typing-dot" />
                <span className="code-helper__typing-dot" />
                <span className="code-helper__typing-dot" />
              </div>
            )}
          </div>
        </>
      )}

      {atLimit ? (
        <div className="code-helper__limit-reached">
          <p>{t("codeHelper.rateLimited")}</p>
          <button className="code-helper__new-chat" onClick={handleNewChat}>
            {t("codeHelper.newChat")}
          </button>
        </div>
      ) : (
        <div className="code-helper__composer">
          <label className="settings__label" htmlFor="helper-question">
            {t("codeHelper.questionLabel")}
          </label>
          <textarea
            id="helper-question"
            className="code-helper__question"
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, CODE_HELP_QUESTION_MAX))}
            // Deliberately not pasteable: the point of asking is to put the
            // question in the kid's own words, not to drop in text copied
            // from somewhere else (the lesson's instructions, a friend, a
            // "just give me the answer" prompt). The code box right below
            // this is a completely different case — pasting the code
            // someone's actually stuck on is the whole point of it — so
            // only this field blocks paste, not CodeEditor.
            onPaste={(e) => e.preventDefault()}
            placeholder={t("codeHelper.questionPlaceholder")}
            rows={3}
          />
          <p className="code-helper__counter">
            {question.length}/{CODE_HELP_QUESTION_MAX}
          </p>
          <p className="code-helper__no-paste-hint">{t("codeHelper.questionNoPaste")}</p>

          <label className="settings__label">{t("codeHelper.codeLabel")}</label>
          <div className="code-helper__editor-frame">
            <CodeEditor
              className="code-helper__code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, CODE_HELP_CODE_MAX))}
              language={defaultLanguage}
              rows={8}
            />
          </div>
          <p className="code-helper__counter">
            {code.length}/{CODE_HELP_CODE_MAX}
          </p>

          <button className="code-helper__ask" onClick={handleSend} disabled={!canSend}>
            {sending ? t("codeHelper.asking") : thread.length > 0 ? t("codeHelper.send") : t("codeHelper.ask")}
          </button>
        </div>
      )}
    </div>
  );
}
