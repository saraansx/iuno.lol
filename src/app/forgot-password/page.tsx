import { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your iuno.lol account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
