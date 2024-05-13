import { observer } from "mobx-react-lite";
import { use, useEffect, useState } from "react";
import Peer from "simple-peer";
import { model as baseModel } from "@/models/Model";
import { default as dashModel } from "@/models/DashboardModel";
import { Box, Center, Flex } from "@chakra-ui/react";
import { PeerObject } from "@/types";
import { PTTProvider, usePTT } from "../contexts/PTTContext";

interface Props {
  model: typeof baseModel;
}
console.log("communications handler file");

//Functional component that renderes a list of peer channels
const CommunicationsHandler = observer(({ model }: Props) => {
  // Update defaultModel whenever dashboardModel changes

  //TODO add delayTime to the model, not dashboardModel
  /* useEffect(() => {
    setDefaultModel(dashboardModel);
    console.log("THE DELAY TIME ISSSSS : " + defaultModel.delayTime);
  }, [dashboardModel]);*/

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
    peerObj: PeerObject;
    peerId: string;
    model: typeof baseModel;
  }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [shouldMute, setShouldMute] = useState<boolean>(true);
    const [shouldMuteAudio, setShouldMuteAudio] = useState<boolean>(false);
    const { pttActive } = usePTT();

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
        if (dataObj.type === "shouldMute") {
          console.log("updateMute received from: ", dataObj.value);
          setShouldMuteAudio(dataObj.value);
          //model.getMyReasons(peerId);
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

    useEffect(() => {
      console.log("peerObj.reasons changed", peerObj.reasons);
    }, [peerObj.reasons]);

    useEffect(() => {
      if (!stream) {
        console.log("stream error", stream);
        return;
      }

      let shouldMuteTmp = true;

      for (const reason of peerObj.reasons) {
        if (model.TXFrequencies.includes(reason) || reason === -1) {
          if (
            reason === -1 ||
            (model.TXFrequencies.includes(reason) && pttActive)
          ) {
            {
              //console.log("TXing on frequency: ", reason);
              shouldMuteTmp = false;
            }
          }
        }
      }
      if (shouldMuteTmp !== shouldMute) {
        setShouldMute(shouldMuteTmp);
      }
    }, [model.TXFrequencies, peerObj.reasons, pttActive]);

    useEffect(() => {
      //console.log("shouldMute changed", shouldMute);

      /*const media = peerObj.stream;
      for (const track of media.getTracks()) {
        track.enabled = !shouldMute;
      }*/
      if (peerObj.peer.connected) {
        peerObj.peer.send(
          JSON.stringify({ type: "shouldMute", value: shouldMute })
        );
      }
    }, [shouldMute]);

    return (
      <>
        <audio
          autoPlay
          playsInline
          id={peerId}
          muted={shouldMuteAudio}
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
