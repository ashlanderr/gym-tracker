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
import { useStore } from "../../components";
import { useSessionState } from "../../api";
import { useSignInState } from "../../session";
import { useQueryProfile } from "../../db";
import { completeOnboarding } from "../../domain";
import {
  ChoiceStep,
  DoneStep,
  HelloStep,
  MeasureStep,
  SexStep,
  WelcomeStep,
} from "./components";
import {
  ADVANCE_DELAY,
  DEFAULT_HEIGHT_CM,
  DEFAULT_WEIGHT_KG,
  EXPERIENCE_OPTIONS,
  HEIGHT_RANGE,
  STEP_TRANSITION,
  STEP_VARIANTS,
  STEPS,
  WEIGHT_RANGE,
} from "./constants.ts";
import { QUESTIONS } from "./questions.ts";
import { isStepId } from "./utils.ts";
import type { OnboardingDraft, Sex, StepId } from "./types.ts";

export function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();
  const accountId = store.documentId;
  const profile = useQueryProfile(store);
  const session = useSessionState();
  const signIn = useSignInState();
  const [draft, setDraft] = useState<OnboardingDraft>({});

  // The step is a history entry, the way a modal is one in `ModalStack`: the
  // Android back button is wired to `window.history`, so anything it should
  // step through has to live there rather than in component state.
  const stepRef = useRef<StepId>("welcome");
  const step = isStepId(location.state) ? location.state : stepRef.current;
  stepRef.current = step;

  const timerRef = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Somebody with a profile has nothing to answer here. Checked on every
  // history move rather than once: the page transition hands a returning
  // path the same instance that is still leaving, so a one-off redirect
  // would have fired already.
  const isOpen = location.pathname === "/onboarding";
  useEffect(() => {
    if (profile && isOpen) navigate("/", { replace: true });
  }, [profile, isOpen, location.key, navigate]);

  const sex = draft.sex ?? "male";
  const direction = useNavigationType() === NavigationType.Pop ? -1 : 1;

  const nextHandler = () => {
    const index = STEPS.indexOf(step);
    if (index < 0 || index === STEPS.length - 1) return;
    navigate(location.pathname, { state: STEPS[index + 1] });
  };

  const backHandler = () => navigate(-1);

  const answerHandler = (answer: Partial<OnboardingDraft>) => {
    setDraft((draft) => ({ ...draft, ...answer }));
    timerRef.current = window.setTimeout(nextHandler, ADVANCE_DELAY);
  };

  // The answers shown on the last step are the ones saved, defaults
  // included. Leaving walks history back over every step to the entry the
  // flow opened on, so the back button on the home screen does not walk into
  // the questions again; that entry turns into home once there is a profile.
  const finishHandler = () => {
    completeOnboarding(store, accountId, {
      sex,
      heightCm: draft.heightCm ?? DEFAULT_HEIGHT_CM[sex],
      weightKg: draft.weightKg ?? DEFAULT_WEIGHT_KG[sex],
      // Unanswered, the safer side is the one that warns.
      experience: draft.experience ?? "novice",
    });
    navigate(-STEPS.indexOf("done"));
  };

  if (profile) return null;

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          session.kind === "account" && (
            <HelloStep account={session.account} onStart={nextHandler} />
          )
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
            options={EXPERIENCE_OPTIONS}
            value={draft.experience}
            onSelect={(experience) => answerHandler({ experience })}
          />
        );

      case "done":
        return <DoneStep draft={draft} onFinish={finishHandler} />;
    }
  };

  // The bar counts questions, so it is empty on the welcome screen and full
  // on the last one.
  const questions = STEPS.slice(1, -1);
  const passed =
    step === "done" ? questions.length - 1 : questions.indexOf(step);

  // The first screen is the app's own, not a question: no way back, no
  // progress to report. With an account it greets instead, once the sign-in
  // has found the account empty rather than while it is still asking.
  if (
    step === "welcome" &&
    (session.kind === "anonymous" || signIn.step !== "idle")
  ) {
    return (
      <div className={s.root}>
        <WelcomeStep onStart={nextHandler} />
      </div>
    );
  }

  return (
    <div className={s.root}>
      <div className={s.top}>
        {/* Hidden rather than gone on the greeting, so the questions after
            it do not jump up by the height of the bar. */}
        <button
          className={clsx(s.back, step === "welcome" && s.hidden)}
          onClick={backHandler}
        >
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
