import DashboardModel, {DashboardFrequency, DashboardRole} from "@/models/DashboardModel";
import { DeleteIcon } from "@chakra-ui/icons";
import { Box, Center, Flex, Icon } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { MdClear } from "react-icons/md";
import { Button } from "@chakra-ui/react";
import { AccordionIcon } from "@chakra-ui/accordion";
import DashboardXCButton from "./DashboardXCButton";
import Dashboard from "@/pages/dashboard";


interface Props {
  model: typeof DashboardModel;
  name: string;
  onDelete: () => void;
  role: DashboardRole;
  frequencyId: number;
}

const DashboardRoleFrequencyCard = observer((props: Props) => {
  const { model, onDelete, name, role, frequencyId } = props;

  return (
    <Box p={2} borderRadius="lg" border="1px" borderColor="gray.500">
      <Flex direction={"row"}>
        <DashboardXCButton model={model} role={role} frequencyId={frequencyId}
          buttonElement={ 
            <Button colorScheme="blue">XC</Button>
          }
        />
        <Center>{parseFloat(name).toFixed(3)} MHz</Center>
        <Flex>
          <Center marginRight={"5px"}>
            <Icon
              as={MdClear}
              boxSize={6}
              cursor="pointer"
              onClick={onDelete}
            />
          </Center>
        </Flex>
      </Flex>
    </Box>
  );
});

export default DashboardRoleFrequencyCard;