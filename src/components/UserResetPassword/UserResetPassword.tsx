import React, { useState } from "react";
import { TextField, Button } from "@material-ui/core";
import API from "../../api";

interface UserResetPasswordProps {
  username: string;
  keyValue: string;
  closeHandler: () => void;
}

const UserResetPassword: React.FC<UserResetPasswordProps> = ({
  username,
  keyValue,
  closeHandler,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post(`/user/reset-password/${keyValue}`, {
        username,
        newPassword,
      });

      if (response.status === 200) {
        closeHandler();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "16px" }}>
      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        type="password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        required
      />
      {error && (
        <div style={{ color: "red", marginTop: "8px" }}>{error}</div>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        style={{ marginTop: "16px" }}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default UserResetPassword;
