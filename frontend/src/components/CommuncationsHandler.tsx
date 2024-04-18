import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
import { model as baseModel } from "@/models/Model";

interface Props {
  model: typeof baseModel;
}

const CommunicationsHandler = observer(({ model }: Props) => {
  if (!model.socket?.io) {
    return null; // Return null instead of <></> for clarity
  }

  return (
    <>
      <div>asd</div>
      {Array.from(model.peers.entries()).map(([id, peer]) => (
        <PeerChannel key={id} peer={peer} peerId={id} />
      ))}
    </>
  );
});

const PeerChannel = observer(
  ({ peer, peerId }: { peer: Peer.Instance; peerId: string }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      // Do something with the peer
      peer.on("stream", (stream) => {
        console.log("GETTING STREAM!!!!");

        setStream(stream);
      });

      return () => {
        // Clean up
      };
    }, [peer]);
    return (
      <>
        <video
          style={{ width: "300px", height: "300px" }}
          autoPlay
          playsInline
          ref={(video) => {
            if (video && stream) {
              video.srcObject = stream;
            }
          }}
        />
        <div>Peer here: {peerId}</div>
        <div>Peer connected: {peer.connected}</div>
      </>
    ); // Show something meaningful
  }
);

export default CommunicationsHandler;
