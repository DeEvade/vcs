import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
interface Props {
  model: typeof baseModel;
}

const CommunicationsHandler = observer((props: Props) => {
  const { model } = props;
  if (!model.socket.io) return <></>;

  const id = model.socket.io.id;

  return <></>;
});

export default CommunicationsHandler;
