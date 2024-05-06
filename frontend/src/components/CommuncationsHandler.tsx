import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import Peer from "simple-peer";
import { model as baseModel } from "@/models/Model";
import { default as dashModel } from "@/models/DashboardModel";
import { Flex } from "@chakra-ui/react";

interface Props {
  model: typeof baseModel;
  dashboardModel: typeof dashModel;
}

console.log("communications handler file");

const CommunicationsHandler = observer(({ model, dashboardModel }: Props) => {
  const [defaultModel, setDefaultModel] = useState(dashboardModel);

  // Update defaultModel whenever dashboardModel changes
  useEffect(() => {
    setDefaultModel(dashboardModel);
    console.log("THE DELAY TIME ISSSSS : " + defaultModel.delayTime);
  }, [dashboardModel]);

  if (!model.socket?.io) {
    console.log("Com. Handler no socket found");
    return null; // Return null instead of <></> for clarity
  }

  console.log("Com. Handler got socket");

  return (
    <>
      <Flex maxWidth="1000px" wrap="wrap" justifyContent="center">
        {Array.from(model.peers.entries()).map(([id, peer]) => (
          <PeerChannel
            key={id}
            peer={peer}
            peerId={id}
            model={model}
            defaultModel={defaultModel}
          />
        ))}
      </Flex>
    </>
  );
});

const PeerChannel = observer(
  ({
    peer,
    peerId,
    model,
    defaultModel,
  }: {
    peer: Peer.Instance;
    peerId: string;
    model: typeof baseModel;
    defaultModel: typeof dashModel;
  }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
      // Do something with the peer
      peer.on("stream", (stream) => {
        setStream(stream);
      });

      return () => {
        // Clean up
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };
    }, [peer]);

    useEffect(() => {
      console.log("TEST###################################################");
      console.log(defaultModel.delayTime);
    }, [stream, defaultModel.delayTime]);

    useEffect(() => {
      if (stream) {
        console.log("applies delay");
        console.log(defaultModel.delayTime);
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const dest = audioContext.createMediaStreamDestination();
        let delayNode = audioContext.createDelay(defaultModel.delayTime); // 1 second delay
        delayNode.delayTime.value = defaultModel.delayTime; // set delay time to 1 second
        source.connect(delayNode);
        delayNode.connect(dest);
        setStream(dest.stream);
      }
    }, [stream != null, defaultModel.delayTime]);

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
              audio.volume = model.radioGain / 100;
            }
          }}
        />
      </>
    ); // Show something meaningful
  }
);

export default CommunicationsHandler;
