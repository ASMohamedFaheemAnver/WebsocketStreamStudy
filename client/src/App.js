import { useEffect, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const videoRef = useRef(null);
  // const socket = io("http://localhost:4000");
  const socket = io("ws://localhost:4000");
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log({ stream });
        // videoRef.current.srcObject = stream;
        const mediaRecorder = new MediaRecorder(stream);
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result; // ~1.1MB if slice time is 2500ms
          console.log({ data });
        };

        mediaRecorder.ondataavailable = async function (event) {
          if (event.data && event.data.size > 0) {
            // reader.readAsDataURL(event.data);
            socket.emit("client:stream", event.data);
          }
        };
        mediaRecorder.start(2500); // slice time interval
      })
      .catch((e) => {
        console.log({ component: App.name, e });
      });
    socket.on("server:stream", (data) => {
      const blob = new Blob([data]);
      videoRef.current.src = URL.createObjectURL(blob);
      console.log({ blob });
    });
  }, []);
  return (
    <div>
      <video ref={videoRef} autoPlay />
    </div>
  );
}

export default App;
