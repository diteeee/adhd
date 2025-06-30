import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";
import bgImage from "assets/images/bg-presentation.jpg";
import axios from "axios";

function SignUpBasic() {
  const [emri, setEmri] = useState("");
  const [mbiemri, setMbiemri] = useState("");
  const [nrTel, setNrTel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [errors, setErrors] = useState({
    emri: "",
    mbiemri: "",
    nrTel: "",
    email: "",
    password: "",
  });

  const validateField = (name, value) => {
    switch (name) {
      case "emri":
      case "mbiemri":
        if (!value) return "This field is required.";
        if (!/^[A-Z][a-zA-Z]*$/.test(value))
          return "Must start with a capital letter and contain only letters.";
        return "";
      case "nrTel":
        if (!value) return "Phone number is required.";
        if (!/^\d{5,15}$/.test(value)) return "Phone number must be 5-15 digits.";
        return "";
      case "email":
        if (!value) return "Email is required.";
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
          return "Invalid email address.";
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters long.";
        return "";
      default:
        return "";
    }
  };

  const navigate = useNavigate();

  // Validate field on change + update state
  const handleChangeWithValidation = (setter, name) => (e) => {
    const val = e.target.value;
    setter(val);
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, val),
    }));
  };

  const isFormValid =
    Object.values(errors).every((e) => e === "") && emri && mbiemri && nrTel && email && password;

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validate all fields before submit
    const newErrors = {
      emri: validateField("emri", emri),
      mbiemri: validateField("mbiemri", mbiemri),
      nrTel: validateField("nrTel", nrTel),
      email: validateField("email", email),
      password: validateField("password", password),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((msg) => msg !== "")) {
      setError("Please fix the errors in the form before submitting.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/users", {
        emri,
        mbiemri,
        nrTel,
        email,
        password,
        role: "user",
      });
      if (response.status === 201) {
        setSuccess("Account created successfully. Redirecting...");
        setTimeout(() => navigate("/pages/authentication/sign-in"), 3000);
      } else {
        setError("Failed to register. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during signup. Please try again.");
      console.error("Signup error:", err.response ? err.response.data : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MKBox
        position="absolute"
        top={0}
        left={0}
        zIndex={1}
        width="100%"
        minHeight="100vh"
        sx={{
          backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <MKBox px={1} width="100%" height="100vh" mx="auto" position="relative" zIndex={2}>
        <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            <Card>
              <MKBox
                variant="gradient"
                bgColor="secondary"
                borderRadius="lg"
                coloredShadow="secondary"
                mx={2}
                mt={-3}
                p={4}
                mb={1}
                textAlign="center"
              >
                <MKTypography variant="h4" fontWeight="medium" color="white" mt={1} mb={2}>
                  Sign up
                </MKTypography>
              </MKBox>
              <MKBox pt={4} pb={3} px={3}>
                <MKBox component="form" role="form" onSubmit={handleSubmit}>
                  <MKBox mb={2}>
                    <MKInput
                      type="text"
                      label="First Name"
                      fullWidth
                      value={emri}
                      onChange={handleChangeWithValidation(setEmri, "emri")}
                      required
                      error={!!errors.emri}
                      helperText={errors.emri}
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="text"
                      label="Last Name"
                      fullWidth
                      value={mbiemri}
                      onChange={handleChangeWithValidation(setMbiemri, "mbiemri")}
                      required
                      error={!!errors.mbiemri}
                      helperText={errors.mbiemri}
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="tel"
                      label="Phone Number"
                      fullWidth
                      value={nrTel}
                      onChange={handleChangeWithValidation(setNrTel, "nrTel")}
                      required
                      error={!!errors.nrTel}
                      helperText={errors.nrTel}
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type="email"
                      label="Email"
                      fullWidth
                      value={email}
                      onChange={handleChangeWithValidation(setEmail, "email")}
                      required
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </MKBox>
                  <MKBox mb={2}>
                    <MKInput
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      fullWidth
                      value={password}
                      onChange={handleChangeWithValidation(setPassword, "password")}
                      required
                      autoComplete="new-password"
                      helperText={errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </MKBox>
                  <MKBox display="flex" alignItems="center" ml={-1}>
                    <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                    <MKTypography
                      variant="button"
                      fontWeight="regular"
                      color="text"
                      onClick={handleSetRememberMe}
                      sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                    >
                      &nbsp;&nbsp;Remember me
                    </MKTypography>
                  </MKBox>
                  {error && (
                    <MKTypography variant="body2" color="error" mt={2}>
                      {error}
                    </MKTypography>
                  )}
                  {success && (
                    <MKTypography variant="body2" color="success" mt={2}>
                      {success}
                    </MKTypography>
                  )}
                  <MKBox mt={4} mb={1}>
                    <MKButton
                      type="submit"
                      variant="gradient"
                      color="secondary"
                      fullWidth
                      disabled={isLoading || !isFormValid} // disable if loading or invalid
                    >
                      {isLoading ? "Signing up..." : "Sign up"}
                    </MKButton>
                  </MKBox>
                  <MKBox mt={3} mb={1} textAlign="center">
                    <MKTypography variant="button" color="text">
                      Already have an account?{" "}
                      <MKTypography
                        component={Link}
                        to="/pages/authentication/sign-in/sign-in"
                        variant="button"
                        color="secondary"
                        fontWeight="medium"
                        textGradient
                      >
                        Sign in
                      </MKTypography>
                    </MKTypography>
                  </MKBox>
                </MKBox>
              </MKBox>
            </Card>
          </Grid>
        </Grid>
      </MKBox>
    </>
  );
}

export default SignUpBasic;
