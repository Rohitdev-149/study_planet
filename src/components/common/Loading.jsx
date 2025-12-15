import React from "react";
import { PropagateLoader } from "react-spinners";
import loadingVideo from "../../assets/Images/preloder.mp4";

const Loading = () => {
  return (
    <>
      <div style={{ ...styles.loaderContainer, backgroundColor: "#000814" }}>
        <video
          src={loadingVideo}
          alt="Loading Video"
          style={styles.video}
          autoPlay
          loop
          muted
          playsInline
        />
        <PropagateLoader size={15} color={"white"} loading={true} />
      </div>
    </>
  );
};

const styles = {
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
    backgroundColor: "white",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  video: {
    marginBottom: "20px",
    height: "250px",
    width: "auto",
    borderRadius: "8px",
    objectFit: "contain",
    backgroundColor: "transparent",
  },
};

export default Loading;
