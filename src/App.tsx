import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Howl } from "howler";

interface AlarmLogEntry {
  time: string;
  youtubeLink: string;
}

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const App = () => {
  const [alarmTime, setAlarmTime] = useState<Date | null>(new Date());
  const [youtubeLink, setYoutubeLink] = useState("");
  const [alarmSound, setAlarmSound] = useState<Howl | null>(null);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmLog, setAlarmLog] = useState<AlarmLogEntry[]>([]);

  useEffect(() => {
    const storedLog = localStorage.getItem("alarmLog");
    if (storedLog) {
      setAlarmLog(JSON.parse(storedLog));
    }

    // Howlオブジェクトの初期化をここで行う
    const sound = new Howl({
      src: ["/alarm.mp3"], // publicフォルダからの相対パス
    });
    setAlarmSound(sound);
  }, []);

  useEffect(() => {
    localStorage.setItem("alarmLog", JSON.stringify(alarmLog));
  }, [alarmLog]);

  const addAlarmLog = (time: string, link: string) => {
    const newLogEntry: AlarmLogEntry = { time, youtubeLink: link };
    setAlarmLog([...alarmLog, newLogEntry]);
  };

  const setAlarm = () => {
    if (alarmTime) {
      setAlarmSet(true);
      const now = new Date();
      const timeDifference = alarmTime.getTime() - now.getTime();

      if (timeDifference > 0) {
        setTimeout(() => {
          startAlarm();
        }, timeDifference);
      }
    }
  };

  const startAlarm = () => {
    if (alarmSound) {
      setAlarmActive(true);
      alarmSound.play();
    }
  };

  const stopAlarm = () => {
    if (alarmTime) {
      addAlarmLog(alarmTime?.toLocaleTimeString()!, youtubeLink);
    }
    if (alarmSound) {
      alarmSound.stop();
    }
    setAlarmActive(false);
    if (youtubeLink) {
      window.open(youtubeLink, "_blank");
    }
  };

  const setAlarmIn3Seconds = () => {
    setAlarmSet(true);
    setTimeout(() => {
      startAlarm();
    }, 3000); // 3秒後にアラームを鳴らす
  };

  const fetchYouTubeLink = async (query: string) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        query
      )}&key=${API_KEY}`
    );
    const data = await response.json();
    const videos = data.items;
    if (videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * videos.length);
      const videoId = videos[randomIndex].id.videoId;
      setYoutubeLink(`https://www.youtube.com/watch?v=${videoId}`);
    }
  };

  const recommendYouTubeLink = (type: "energy" | "relax" | "meditate") => {
    switch (type) {
      case "energy":
        fetchYouTubeLink("気合を入れる動画");
        break;
      case "relax":
        fetchYouTubeLink("リラックスできる音楽");
        break;
      case "meditate":
        fetchYouTubeLink("瞑想の音楽");
        break;
      default:
        break;
    }
  };

  const renderAlarmLog = () => {
    return alarmLog.map((entry, index) => (
      <div key={index} style={styles.logEntry}>
        <p>Time: {entry.time}</p>
        <p>
          YouTube Link:{" "}
          <a href={entry.youtubeLink} target="_blank" rel="noopener noreferrer">
            Watch
          </a>
        </p>
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>YouTube Alarm</h1>
      <div>
        <label>Set Alarm Time: </label>
        <DatePicker
          selected={alarmTime}
          onChange={(date) => setAlarmTime(date)}
          showTimeSelect
          dateFormat="Pp"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter YouTube Link"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
          style={styles.input}
        />
      </div>
      <div>
        <button
          onClick={() => recommendYouTubeLink("energy")}
          style={styles.recommendButton}
        >
          気合を入れたい
        </button>
        <button
          onClick={() => recommendYouTubeLink("relax")}
          style={styles.recommendButton}
        >
          リラックスしたい
        </button>
        <button
          onClick={() => recommendYouTubeLink("meditate")}
          style={styles.recommendButton}
        >
          瞑想したい
        </button>
      </div>
      <button onClick={setAlarm} style={styles.button}>
        Set Alarm
      </button>
      <button onClick={setAlarmIn3Seconds} style={styles.button}>
        Set Alarm in 3 Seconds
      </button>
      {alarmActive && (
        <button onClick={stopAlarm} style={styles.stopButton}>
          Stop Alarm
        </button>
      )}
      {alarmSet && <p>Alarm set for {alarmTime?.toLocaleTimeString()}</p>}

      <h2 style={styles.subTitle}>Alarm Log</h2>
      <div style={styles.logContainer}>{renderAlarmLog()}</div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center" as const,
    padding: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  input: {
    height: "30px",
    width: "80%",
    margin: "10px",
    padding: "5px",
    border: "1px solid gray",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "5px",
  },
  stopButton: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "red",
    color: "white",
    margin: "5px",
  },
  recommendButton: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "5px",
    backgroundColor: "#4CAF50",
    color: "white",
  },
  subTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "20px",
  },
  logContainer: {
    textAlign: "left" as const,
    marginTop: "20px",
    border: "1px solid #ccc",
    padding: "10px",
    maxHeight: "200px",
    overflowY: "auto" as const,
  },
  logEntry: {
    marginBottom: "10px",
    paddingBottom: "5px",
    borderBottom: "1px solid #eee",
  },
};

export default App;
