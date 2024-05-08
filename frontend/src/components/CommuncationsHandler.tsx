import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
import { model as baseModel } from "@/models/Model";
import { Flex } from "@chakra-ui/react";

interface Props {
  model: typeof baseModel;
}
console.log("communications handler file");

//Functional component that renderes a list of peer channels 
const CommunicationsHandler = observer(({ model }: Props) => {
  if (!model.socket?.io) {
    console.log("Com. Handler no socket found");
    return null;
  }

  return (
    <>
      <Flex maxWidth="1000px" wrap="wrap" justifyContent="center">
        {Array.from(model.peers.entries()).map(([id, peer]) => (
          <PeerChannel key={id} peer={peer} peerId={id} model={model} />
        ))}
      </Flex>
    </>
  );
});

//Handles streaming audio from a peer and renderes an audio element
const PeerChannel = observer(
  ({
    peer,
    peerId,
    model,
  }: {
    peer: Peer.Instance;
    peerId: string;
    model: typeof baseModel;
  }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      //When a stream event occurs, update the stream with the new stream
      peer.on("stream", (stream) => {
        setStream(stream);
      });

      //Clean up function that stops all tracks of the current stream if it exists
      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };
    }, [peer]);

    //Renderes an audio element with different attributes 
    return (
      <>
        <audio
          autoPlay
          playsInline
          id={peerId}
          ref={(audio) => {
            if (audio && stream) {
              audio.srcObject = stream;
              audio.volume = model.radioGain / 100;
            }
          }}
        />
      </>
    );
  }
);

export default CommunicationsHandler;
