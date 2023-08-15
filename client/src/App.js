import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import UserContext from "./UserContext";
import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";

function App() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:4000/user", { withCredentials: true })
      .then((response) => {
        setEmail(response.data.email);
      });
  }, []);

  function logout() {
    axios
      .post("http://localhost:4000/logout", {}, { withCredentials: true })
      .then(() => {
        setEmail("");
      });
  }

  return (
    <UserContext.Provider value={{ email, setEmail }}>
      <BrowserRouter>
        <div>
          {!!email && (
            <div>
              You're logged in as {email}
              <button onClick={() => logout()}>Logout</button>
            </div>
          )}
          {!email && <div>Not logged in</div>}
        </div>
        <div>
          <Link to={"/"}>Home | </Link>
          <Link to={"/login"}>Login | </Link>
          <Link to={"/register"}>Register</Link>
        </div>
        <Routes>
          <Route exact path={"/register"} element={<Register />} />
          <Route exact path={"/login"} element={<Login />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
