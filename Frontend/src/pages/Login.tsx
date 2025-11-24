import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { useState, type FormEvent } from "react";
import { login as loginServicies } from "../services/auth/auth.services";
import { getErrorMessage } from "../utils/auth.errors";
import { Link, Navigate, useNavigate } from "react-router";
import { addToast } from "@heroui/toast";
import { useAuth } from "../context/authContext";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, isAuthenticated } = useAuth();

  const onHandlerForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await loginServicies({ email, password });
      const userData = {
        id: response.id,
        email: response.email,
      };
      login(userData, response.token);
      addToast({
        title: "Login successfully",
        color: "success",
      });
      navigate("/");
    } catch (err) {
      const friendlyError = getErrorMessage(err);
      addToast({ title: friendlyError, color: "danger" });
    }
  };
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <section className="w-1/3 flex flex-col items-center gap-4 rounded-lg p-6">
        <img src="/DCICFLIX-logo.png" alt="DCICFLIX logo" className="w-96" />
        <Form
          onSubmit={onHandlerForm}
          className="flex flex-col items-center gap-6 w-full"
        >
          <Input
            label="email"
            type="email"
            value={email}
            required
            onValueChange={setEmail}
          />
          <Input
            label="password"
            type="password"
            value={password}
            required
            onValueChange={setPassword}
          />
          <p className="text-white">
            Don't have an account?{" "}
            <Link className="text-dcicflix" to={"/register"}>
              Sign up
            </Link>
          </p>
          <Button
            variant="solid"
            type="submit"
            className="bg-dcicflix font-bold "
          >
            Login
          </Button>
        </Form>
      </section>
    </main>
  );
}

export default Login;
