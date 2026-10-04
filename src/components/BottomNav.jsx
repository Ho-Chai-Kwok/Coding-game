import { useI18n } from "../i18n/I18nContext";

// The app's 5 primary destinations, always reachable from a fixed bar at
// the bottom of the screen — switching between them no longer requires
// going back to a "home" screen first. `id` matches the `mode` state in
// App.jsx directly (null means Home/the dashboard).
const TABS = [
  { id: null, icon: "🏠", labelKey: "home" },
  { id: "learning", icon: "🗺️", labelKey: "learn" },
  { id: "sidequest", icon: "🧭", labelKey: "quests" },
  { id: "ranked", icon: "🏆", labelKey: "ranked" },
  { id: "characters", icon: "🎭", labelKey: "characters" },
];

export default function BottomNav({ active, onSelect, lockedTabs = [] }) {
  const { t } = useI18n();

  return (
    <nav className="bottom-nav" aria-label={t("bottomNav.label")}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const isLocked = lockedTabs.includes(tab.id);
        return (
          <button
            key={tab.id ?? "home"}
            className={`bottom-nav__tab${isActive ? " bottom-nav__tab--active" : ""}`}
            onClick={() => onSelect(tab.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav__icon">
              {tab.icon}
              {isLocked && <span className="bottom-nav__lock" aria-hidden="true">🔒</span>}
            </span>
            <span className="bottom-nav__label">{t(`bottomNav.${tab.labelKey}`)}</span>
          </button>
        );
      })}
    </nav>
  );
}
