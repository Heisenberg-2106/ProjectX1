import WebRTCVideoCall from '@/components/webrtvc';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VideoCallPage = () => {
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <WebRTCVideoCall roomId="telemedicineRoom" />
      </div>
      <Footer />
    </>
  );
};

export default VideoCallPage;