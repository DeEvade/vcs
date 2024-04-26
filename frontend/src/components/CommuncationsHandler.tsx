import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
import { model as baseModel } from "@/models/Model";
import { Flex } from "@chakra-ui/react";

interface Props {
  model: typeof baseModel;
}
console.log("communications handler file");

const CommunicationsHandler = observer(({ model }: Props) => {
  if (!model.socket?.io) {
    console.log("???????");
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
    console.log("BEFORE GETTING STREM!!!");
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      // Do something with the peer
      console.log("BEFORE GETTING STREAM ON!!!!")
      peer.on("stream", (stream) => {
        console.log("GETTING STREAM!!!!");

        setStream(stream);
      });

      return () => {
        // Clean up
        if(stream){
          stream.getTracks().forEach((track) => {
            track.stop();
          })
        }
      };
    }, [peer]);

    return (
      <>
        <Flex direction="column" alignItems="center">
          <h1>{peerId}</h1>
          <h2>Status: {peer.connected !== true ? "online" : "offline"}</h2>
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
