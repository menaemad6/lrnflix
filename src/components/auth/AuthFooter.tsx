
import React from "react";
import { Link } from "react-router-dom";

interface AuthFooterProps {
  mode: "login" | "signup";
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ mode }) => (
  <div className="text-center pt-6">
    {mode === "login" ? (
      <p className="text-slate-400">
        Don't have an account?
        <Link
          to="/auth/signup"
          className="ml-1 font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors story-link"
        >
          Sign up
        </Link>
      </p>
    ) : (
      <p className="text-slate-400">
        Already have an account?
        <Link
          to="/auth/login"
          className="ml-1 font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors story-link"
        >
          Log in
        </Link>
      </p>
    )}
  </div>
);
