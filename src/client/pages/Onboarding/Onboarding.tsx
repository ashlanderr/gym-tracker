import s from "./styles.module.scss";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  NavigationType,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { MdArrowBack } from "react-icons/md";
import {
  AnchorStep,
  ChoiceStep,
  DoneStep,
  MeasureStep,
  SexStep,
  WelcomeStep,
} from "./components";
import {
  ADVANCE_DELAY,
  ANCHORS,
  DEFAULT_HEIGHT_CM,
  DEFAULT_WEIGHT_KG,
  EXPERIENCE_OPTIONS,
  HEIGHT_RANGE,
  STEP_TRANSITION,
  STEP_VARIANTS,
  WEIGHT_RANGE,
} from "./constants.ts";
import { QUESTIONS } from "./questions.ts";
import { buildSteps, isStepId } from "./utils.ts";
import type {
  AnchorEntry,
  AnchorSpec,
  Experience,
  OnboardingDraft,
  Sex,
  StepId,
} from "./types.ts";

export function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState<OnboardingDraft>({ anchors: {} });

  // The step is a history entry, the way a modal is one in `ModalStack`: the
  // Android back button is wired to `window.history`, so anything it should
  // step through has to live there rather than in component state.
  const stepRef = useRef<StepId>("welcome");
  const step = isStepId(location.state) ? location.state : stepRef.current;
  stepRef.current = step;

  // A chosen answer advances the step by itself, and by then the draft that
  // decides which steps there are has already changed.
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const timerRef = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const steps = buildSteps(draft.experience);
  const sex = draft.sex ?? "male";
  const direction = useNavigationType() === NavigationType.Pop ? -1 : 1;

  const nextHandler = () => {
    const list = buildSteps(draftRef.current.experience);
    const index = list.indexOf(step);
    if (index < 0 || index === list.length - 1) return;
    navigate(location.pathname, { state: list[index + 1] });
  };

  const backHandler = () => navigate(-1);

  const answerHandler = (answer: Partial<OnboardingDraft>) => {
    setDraft((draft) => ({ ...draft, ...answer }));
    timerRef.current = window.setTimeout(nextHandler, ADVANCE_DELAY);
  };

  // Answering "только начинаю" takes the lifts out of the flow, so whatever
  // was already given for them goes too: a step nobody can reach any more
  // must not keep sending numbers to the summary and to the profile.
  const experienceHandler = (experience: Experience) =>
    answerHandler(
      experience === "none" ? { experience, anchors: {} } : { experience },
    );

  const anchorHandler = (
    anchor: AnchorSpec,
    entry: AnchorEntry | undefined,
  ) => {
    setDraft((draft) => {
      const anchors = { ...draft.anchors };
      if (entry) {
        anchors[anchor.id] = entry;
      } else {
        delete anchors[anchor.id];
      }
      return { ...draft, anchors };
    });
    nextHandler();
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <WelcomeStep onStart={nextHandler} onSkip={() => navigate("/")} />
        );

      case "sex":
        return (
          <SexStep
            value={draft.sex}
            onSelect={(value: Sex) => answerHandler({ sex: value })}
          />
        );

      case "height":
        return (
          <MeasureStep
            {...QUESTIONS.height}
            range={HEIGHT_RANGE}
            units="см"
            decimals={0}
            value={draft.heightCm ?? DEFAULT_HEIGHT_CM[sex]}
            onChange={(heightCm) => setDraft((d) => ({ ...d, heightCm }))}
            onNext={nextHandler}
          />
        );

      case "weight":
        return (
          <MeasureStep
            {...QUESTIONS.weight}
            range={WEIGHT_RANGE}
            units="кг"
            decimals={1}
            value={draft.weightKg ?? DEFAULT_WEIGHT_KG[sex]}
            onChange={(weightKg) => setDraft((d) => ({ ...d, weightKg }))}
            onNext={nextHandler}
          />
        );

      case "experience":
        return (
          <ChoiceStep
            {...QUESTIONS.experience}
            options={EXPERIENCE_OPTIONS[sex]}
            value={draft.experience}
            onSelect={experienceHandler}
          />
        );

      case "done":
        return <DoneStep draft={draft} onFinish={() => navigate("/")} />;

      default: {
        const anchor = ANCHORS.find(({ id }) => id === step)!;

        return (
          <AnchorStep
            anchor={anchor}
            sex={sex}
            entry={draft.anchors[anchor.id]}
            isFirst={anchor === ANCHORS[0]}
            onSubmit={(entry) => anchorHandler(anchor, entry)}
            onSkip={() => anchorHandler(anchor, undefined)}
          />
        );
      }
    }
  };

  // The bar counts questions, so it is empty on the welcome screen and full
  // on the last one. It also loses segments when a novice skips the lifts.
  const questions = steps.slice(1, -1);
  const passed =
    step === "done" ? questions.length - 1 : questions.indexOf(step);

  return (
    <div className={s.root}>
      <div className={s.top}>
        <button className={s.back} onClick={backHandler}>
          <MdArrowBack />
        </button>
      </div>
      {/* The strip keeps its room on the welcome screen but draws nothing:
          there is no progress to report before the first question. */}
      <div className={s.progress}>
        {passed >= 0 &&
          questions.map((question, index) => (
            <i key={question} className={clsx(index <= passed && s.filled)} />
          ))}
      </div>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={step}
          className={s.stage}
          custom={direction}
          variants={STEP_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={STEP_TRANSITION}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
