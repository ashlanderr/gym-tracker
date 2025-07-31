import { signInAnonymously, signInWithGoogle } from "../../firebase/auth.ts";
import { useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";
import s from "./styles.module.scss";
import { AppIconUrl } from "./assets";

export function SignIn() {
  const navigate = useNavigate();

  const signInGoogleHandler = async () => {
    await signInWithGoogle();
    navigate("/", { replace: true });
  };

  const signInAnonymouslyHandler = async () => {
    await signInAnonymously();
    navigate("/", { replace: true });
  };

  return (
    <div className={s.root}>
      <img className={s.icon} src={AppIconUrl} alt="App Icon" />
      <div className={s.title}>Gym Tracker</div>
      <div className={s.providers}>
        <button className={s.providerButton} onClick={signInGoogleHandler}>
          <FcGoogle />
          Войти через Google
        </button>
        <button className={s.providerButton} onClick={signInAnonymouslyHandler}>
          Войти анонимно
        </button>
      </div>
    </div>
  );
}
