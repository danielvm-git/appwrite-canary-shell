import { useNavigate } from "react-router-dom";
import { Avatar, Icon } from "../components/ui";
import { useSession } from "../hooks/useSession";
import { useTodo } from "../hooks/useTodo";
import { PageHead } from "./AppLayout";

export function AccountPage() {
  const { signOut } = useSession();
  const { me } = useTodo();
  const navigate = useNavigate();

  async function onSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <>
      <PageHead title="Account" />
      <div className="card card-pad" style={{ maxWidth: 520 }}>
        <div className="stat-head">
          <Avatar id={me.id} name={me.name} />
          <div>
            <div className="user-name">{me.name}</div>
            <div className="muted">{me.email}</div>
          </div>
        </div>
        <div className="kv">
          <span>User ID</span>
          <span className="mono">{me.id}</span>
        </div>
        <div className="kv">
          <span>Sign-in method</span>
          <span>Appwrite Auth · email and password</span>
        </div>
        <button type="button" className="btn btn-danger" style={{ alignSelf: "flex-start" }} onClick={() => void onSignOut()}>
          <Icon name="sign-out" />
          Sign out
        </button>
      </div>
    </>
  );
}
