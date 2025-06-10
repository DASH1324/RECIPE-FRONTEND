import React from "react";
import "./SocialAuth.css";

const SocialAuth = () => {
  return (
    <div className="social-auth-container">
      {/* If you had social buttons or a divider, they would go here */}
      {/*
      <div className="divider">
        <hr className="divider-line" />
        <span className="divider-text">OR</span>
        <hr className="divider-line" />
      </div>
      <div className="social-buttons">
        <button className="social-button google">Google</button>
        <button className="social-button facebook">Facebook</button>
        <button className="social-button apple">Apple</button>
      </div>
      */}
      <p className="terms-text">
        By continuing, you agree to our{" "}
        <a href="/terms-of-service" className="terms-link"> {/* Use more specific class */}
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy-policy" className="terms-link"> {/* Use more specific class */}
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default SocialAuth;