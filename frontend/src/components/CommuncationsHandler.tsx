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
          <PeerChannel key={id} peer={peer} peerId={id} model={model}/>
        ))}
      </Flex>
    </>
  );
});

const PeerChannel = observer(
  ({ peer, peerId, model }: { peer: Peer.Instance; peerId: string; model: typeof baseModel }) => {
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

    useEffect(() => {
      console.log("########### ########## ######### radiogain is: " + model.radioGain);
    }, [model.radioGain]);

    useEffect(() => {
      const updateVolume = () => {
        if (stream) {
          const video = document.getElementById(peerId) as HTMLVideoElement;
          if (video) {
            video.volume = model.radioGain / 100;
          }
        }
      };
    }, [model.radioGain]);

    return (
      <>
        <script src="./SocketHandler.tsx"></script>
        <video
          style={{ width: "100px", height: "100px" }}
          autoPlay
          playsInline
          id={peerId}
          ref={(video) => {
            if (video && stream) {
              video.srcObject = stream;
              video.volume = model.radioGain/100;
            }
          }}
        />
      </>
    ); // Show something meaningful
  }
);

export default CommunicationsHandler;
