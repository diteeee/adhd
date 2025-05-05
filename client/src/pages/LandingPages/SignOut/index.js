export default function SignOutPage() {
  localStorage.removeItem("token");
  window.location.href = "/pages/authentication/sign-in";
  return <></>;
}
