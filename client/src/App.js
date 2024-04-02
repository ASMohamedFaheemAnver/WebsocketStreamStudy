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
  }, []);

  useEffect(() => {
    const mediaSource = new MediaSource();
    videoRef.current.src = URL.createObjectURL(mediaSource);
    const onSourceBufferUpdateEnd = () => {
      console.log({ msg: "updateend" });
      // If the video element is not already playing, start playing it
      if (videoRef.current.paused) {
        console.log({
          msg: "pushed player is restarting/playing",
        });
        videoRef.current.play();
      }
    };
    const onSourceBufferError = (event) => {
      console.error(event);
    };
    const onMediaSourceOpen = () => {
      console.log({
        msg: "source open",
      }); // Source happening 2 times in debugging mode
      // Create a new SourceBuffer
      const sourceBuffer = mediaSource.addSourceBuffer(
        'video/webm; codecs="vp8, opus"'
      );
      socket.on("server:stream", (stream) => {
        console.log({
          msg: "server:stream",
        });
        if (mediaSource.readyState === "open" && !sourceBuffer.updating) {
          console.log({ msg: "appending buffer" });
          sourceBuffer.appendBuffer(stream);
        } else {
          console.log({ readyState: mediaSource.readyState });
        }
      });
      // When the SourceBuffer has enough data to start playing
      sourceBuffer.addEventListener("updateend", onSourceBufferUpdateEnd);
      sourceBuffer.addEventListener("error", onSourceBufferError);
    };

    // When the mediaSource is successfully opened
    mediaSource.addEventListener("sourceopen", onMediaSourceOpen);

    return () => {
      mediaSource.removeEventListener("sourceopen", onMediaSourceOpen);
      // This causing issue
      // sourceBuffer.removeEventListener(
      //   "updateend",
      //   onSourceBufferUpdateEnd
      // );
      // sourceBuffer.removeEventListener("error", onSourceBufferError);
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay />
    </div>
  );
}

export default App;
