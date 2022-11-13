import React, { useState } from "react";
import ParticlesBg from "particles-bg";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Navigation from "./components/Navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import "./App.css";

const App = () => {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // const [box, setBox] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [route, setRoute] = useState("signin");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  });

  const loadUser = (data) => {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
    });
  };
  //added to check if server is being read
  // const componemtDidMount = () => {
  //   fetch("http://localhost:3000/")
  //     .then((response) => response.json())
  //     .then(console.log);
  // };
  // componemtDidMount();

  //GET ONE BOX
  // const calculateFaceLocation = (data) => {
  //   const clarifaiFace =
  //     data.outputs[0].data.regions[0].region_info.bounding_box;
  //   const image = document.getElementById("inputimage");
  //   const width = Number(image.width);
  //   const height = Number(image.height);
  //   return {
  //     leftCol: clarifaiFace.left_col * width,
  //     topRow: clarifaiFace.top_row * height,
  //     rightCol: width - clarifaiFace.right_col * width,
  //     bottomRow: height - clarifaiFace.bottom_row * height,
  //   };
  // };

  //GET ONE BOX
  // const displayFaceBox = (box) => {
  //   setBox(box);
  // };

  //GET MULTIPLE BOXES
  const calculateFaceLocation = (data) => {
    const clarifaiFaces = data.outputs[0].data.regions.map(
      (region) => region.region_info.bounding_box
    );
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);

    return clarifaiFaces.map((face) => {
      return {
        leftCol: face.left_col * width,
        topRow: face.top_row * height,
        rightCol: width - face.right_col * width,
        bottomRow: height - face.bottom_row * height,
      };
    });
  };

  //GET MULTIPLE BOXES
  const displayFaceBox = (boxes) => {
    setBoxes(boxes);
  };

  const onInputChange = (event) => {
    setInput(event.target.value);
  };

  const onButtonSubmit = () => {
    setImageUrl(input);
    fetch("http://localhost:3000/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: input }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          if (response.outputs[0].data.regions.length != 0) {
            const faces = response.outputs[0].data.regions.length;
            fetch("http://localhost:3000/image", {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: user.id,
                faces: faces,
              }),
            })
              .then((response) => response.json())
              .then((count) => {
                //setUser(Object.assign(user, { entries: count })); //somehow this method does not update state until the input is cleared
                setUser({ ...user, entries: count }); //this method works better
              });
            displayFaceBox(calculateFaceLocation(response));
            setError("");
          } else {
            setError("Sorry, I could not find a face");
          }
        }
      })
      .catch((err) => {
        setError("Sorry, I could not find a face");
      });
  };

  const onRouteChange = (route) => {
    if (route === "signout") {
      setIsSignedIn(false);
      setImageUrl("");
      setBox("");
      setInput("");
      setRoute("signin");
    } else if (route === "home") {
      setIsSignedIn(true);
      setRoute("home");
    } else {
      setRoute(route);
    }
  };

  return (
    <div className="App">
      <ParticlesBg type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === "home" ? (
        <div>
          <Logo />
          <Rank name={user.name} entries={user.entries} error={error} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
        </div>
      ) : route === "signin" ? (
        <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
      ) : (
        <Register loadUser={loadUser} onRouteChange={onRouteChange} />
      )}
    </div>
  );
};

export default App;
