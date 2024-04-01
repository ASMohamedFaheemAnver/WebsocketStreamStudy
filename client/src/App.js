import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const videoRef = useRef(null);
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
            reader.readAsDataURL(event.data);
            // console.log({ data: URL.createObjectURL(event.data) });
          }
        };
        mediaRecorder.start(2500); // slice time interval
      })
      .catch((e) => {
        console.log({ component: App.name, e });
      });
  }, []);
  return (
    <div>
      <video ref={videoRef} autoPlay />
    </div>
  );
}

export default App;
