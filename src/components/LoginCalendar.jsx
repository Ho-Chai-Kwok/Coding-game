import { useI18n } from "../i18n/I18nContext";
import { STREAK_MILESTONES } from "../data/rewards";

const WEEKDAY_KEYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  return cells;
}

export default function LoginCalendar({
  loginDates,
  streak,
  claimedMilestones,
  newlyEarnedRewards,
  onDismissRewards,
  onBack,
}) {
  const { t } = useI18n();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDay = now.getDate();
  const monthName = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const loginSet = new Set(loginDates);
  const cells = buildMonthGrid(year, month);

  const nextMilestone = STREAK_MILESTONES.find((m) => !claimedMilestones.includes(m.day));

  return (
    <div className="calendar-screen">
      <button className="back-link" onClick={onBack}>
        ← {t("backToModes")}
      </button>

      <header className="calendar-screen__header">
        <span className="calendar-screen__icon">📅</span>
        <h1>{t("calendar.title")}</h1>
        <p className="calendar-screen__streak">
          🔥 {streak} {t("modeSelect.dayStreak")}
        </p>
      </header>

      {newlyEarnedRewards.length > 0 && (
        <div className="calendar-screen__banner">
          <p className="calendar-screen__banner-title">{t("calendar.newReward")}</p>
          <div className="calendar-screen__banner-rewards">
            {newlyEarnedRewards.map((m) => (
              <span key={m.day} className="calendar-screen__banner-chip">
                {m.avatar ? m.avatar : `+${m.lp} LP`}
              </span>
            ))}
          </div>
          <button className="calendar-screen__banner-dismiss" onClick={onDismissRewards}>
            {t("calendar.awesome")}
          </button>
        </div>
      )}

      <div className="calendar-grid-card">
        <p className="calendar-grid-card__month">{monthName}</p>
        <div className="calendar-grid">
          {WEEKDAY_KEYS.map((d) => (
            <span key={d} className="calendar-grid__weekday">
              {d}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={`empty-${i}`} />;
            const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
            const loggedIn = loginSet.has(dateKey);
            const isToday = day === todayDay;
            return (
              <span
                key={dateKey}
                className={`calendar-grid__day${loggedIn ? " calendar-grid__day--logged" : ""}${
                  isToday ? " calendar-grid__day--today" : ""
                }`}
              >
                {loggedIn ? "⭐" : day}
              </span>
            );
          })}
        </div>
      </div>

      <h2 className="calendar-screen__ladder-title">{t("calendar.rewardLadder")}</h2>
      <div className="reward-ladder">
        {STREAK_MILESTONES.map((m) => {
          const claimed = claimedMilestones.includes(m.day);
          const isNext = !claimed && nextMilestone && nextMilestone.day === m.day;
          return (
            <div
              key={m.day}
              className={`reward-row${claimed ? " reward-row--claimed" : ""}${
                isNext ? " reward-row--next" : ""
              }`}
            >
              <span className="reward-row__icon">{m.avatar ? m.avatar : "🎁"}</span>
              <div className="reward-row__text">
                <span className="reward-row__day">
                  {t("calendar.day")} {m.day}
                </span>
                <span className="reward-row__desc">
                  {m.avatar && m.lp
                    ? `+${m.lp} LP · ${t("calendar.unlockAvatar")}`
                    : m.avatar
                      ? t("calendar.unlockAvatar")
                      : `+${m.lp} LP`}
                </span>
              </div>
              <span className="reward-row__status">
                {claimed ? "✓" : isNext ? "🎯" : "🔒"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
