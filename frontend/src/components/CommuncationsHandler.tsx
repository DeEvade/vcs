import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
import { model as baseModel } from "@/models/Model";
import { Box, Center, Flex } from "@chakra-ui/react";
import { peerObject } from "@/types";

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
        {Array.from(model.peers.entries()).map(([id, peerObj]) => (
          <PeerChannel key={id} peerObj={peerObj} peerId={id} model={model} />
        ))}
      </Flex>
    </>
  );
});

//Handles streaming audio from a peer and renderes an audio element
const PeerChannel = observer(
  ({
    peerObj,
    peerId,
    model,
  }: {
    peerObj: peerObject;
    peerId: string;
    model: typeof baseModel;
  }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const peer = peerObj.peer;
    useEffect(() => {
      //When a stream event occurs, update the stream with the new stream
      peer.on("stream", (stream) => {
        setStream(stream);
      });

      //Clean up function that stops all tracks of the current stream if it exists
      peer.on("data", (data) => {
        const dataObj = JSON.parse(data.toString());
        if (dataObj.type === "updateReasons") {
          console.log("updateReasons received from: ", dataObj.userId);
          model.getMyReasons(peerId);
        }
        // Handle data
      });

      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };
    }, [peer]);

    //Renderes an audio element with different attributes
    useEffect(() => {
      console.log("peers changed", model.peers);
    }, [model.peers]);

    return (
      <>
        <Box
          key={peerId}
          w="200px"
          h="200px"
          border="1px"
          borderColor="gray.500"
        >
          <Center w={"100%"}>{peerId}</Center>
          <Center w={"100%"}>{peerObj.reasons.toString()}</Center>

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
        </Box>
      </>
    );
  }
);

export default CommunicationsHandler;
