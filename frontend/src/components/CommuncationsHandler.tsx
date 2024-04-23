import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
import { model as baseModel } from "@/models/Model";
import { Flex } from "@chakra-ui/react";

interface Props {
  model: typeof baseModel;
}

const CommunicationsHandler = observer(({ model }: Props) => {
  if (!model.socket?.io) {
    return null; // Return null instead of <></> for clarity
  }

  return (
    <>
      <Flex maxWidth="1000px" wrap="wrap" justifyContent="center">
        {Array.from(model.peers.entries()).map(([id, peer]) => (
          <PeerChannel key={id} peer={peer} peerId={id} />
        ))}
      </Flex>
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
        <Flex direction="column" alignItems="center">
          <h1>{peerId}</h1>
          <h2>Status: {peer.connected}</h2>
          <video
            style={{ width: "250px", height: "250px" }}
            autoPlay
            playsInline
            ref={(video) => {
              if (video && stream) {
                video.srcObject = stream;
              }
            }}
          />
        </Flex>
      </>
    ); // Show something meaningful
  }
);

export default CommunicationsHandler;
