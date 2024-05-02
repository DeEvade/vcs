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
    console.log("Com. Handler no socket found");
    return null; // Return null instead of <></> for clarity
  }

  console.log("Com. Handler got socket")

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
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      // Do something with the peer
      peer.on("stream", (stream) => {
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
      const updateVolume = () => {
        if (stream) {
          const audio = document.getElementById(peerId) as HTMLAudioElement;
          if (audio) {
            audio.volume = model.radioGain / 100;
          }
        }
      };
    }, [model.radioGain]);

    return (
      <>
        <script src="./SocketHandler.tsx"></script>
        <audio
          autoPlay
          playsInline
          id={peerId}
          ref={(audio) => {
            if (audio && stream) {
              audio.srcObject = stream;
              audio.volume = model.radioGain/100;
            }
          }}
        />
      </>
    ); // Show something meaningful
  }
);

export default CommunicationsHandler;
