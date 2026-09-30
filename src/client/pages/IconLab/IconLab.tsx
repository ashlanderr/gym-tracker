import { OctusIcon } from "./components";
import { ICON_VARIANTS } from "./constants.ts";
import type { IconColors } from "./types.ts";
import s from "./styles.module.scss";

// Candidate colorings of the launcher icon: an overview to compare them side
// by side, then each one large and at the real sizes it gets in the RuStore
// search list and on a home screen. Variant 0 is the current icon.
export function IconLab() {
  return (
    <div className={s.root}>
      <div className={s.title}>Иконка</div>
      <div className={s.overview}>
        {ICON_VARIANTS.map((variant, i) => (
          <div key={variant.name} className={s.overviewItem}>
            <OctusIcon className={s.largeIcon} colors={variant} />
            <span className={s.index}>{i}</span>
          </div>
        ))}
      </div>
      {ICON_VARIANTS.map((variant, i) => (
        <VariantCard
          key={variant.name}
          index={i}
          name={variant.name}
          note={variant.note}
          colors={variant}
        />
      ))}
    </div>
  );
}

interface VariantCardProps {
  index: number;
  name: string;
  note: string;
  colors: IconColors;
}

function VariantCard({ index, name, note, colors }: VariantCardProps) {
  return (
    <div className={s.card}>
      <div className={s.heading}>
        <span className={s.index}>{index}</span>
        <div>
          <div className={s.name}>{name}</div>
          <div className={s.note}>{note}</div>
        </div>
      </div>

      <div className={s.large}>
        <OctusIcon className={s.largeIcon} colors={colors} />
        <OctusIcon className={s.largeIcon} colors={colors} mask="circle" />
      </div>

      <div className={s.store}>
        <OctusIcon className={s.storeIcon} colors={colors} />
        <div>
          <div className={s.storeName}>Октус — дневник тренировок</div>
          <div className={s.storeCategory}>Спорт</div>
        </div>
      </div>

      <div className={s.homes}>
        <div className={s.homeDark}>
          <OctusIcon className={s.homeIcon} colors={colors} mask="circle" />
          Октус
        </div>
        <div className={s.homeLight}>
          <OctusIcon className={s.homeIcon} colors={colors} mask="circle" />
          Октус
        </div>
      </div>
    </div>
  );
}
