import DashboardModel from "@/models/DashboardModel";
import { DeleteIcon } from "@chakra-ui/icons";
import { Box, Center, Flex, Icon } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { MdClear } from "react-icons/md";
import { Button } from "@chakra-ui/react";
import { AccordionIcon } from "@chakra-ui/accordion";

interface Props {
  model: typeof DashboardModel;
  name: string;
  onDelete: () => void;
}
const DashboardRoleFrequencyCard = observer((props: Props) => {
  const { model, onDelete, name } = props;
  return (
    <Box p={2} borderRadius="lg" border="1px" borderColor="gray.500">
      <Flex direction={"row"}>
        <Button colorScheme="white" variant="outline">
          XC
        </Button>
        <Center flex={1}>{parseFloat(name).toFixed(3)} MHz</Center>
        <Center marginRight={"5px"}>
          <Icon as={MdClear} boxSize={6} cursor="pointer" onClick={onDelete} />
        </Center>
      </Flex>
    </Box>
  );
});

export default DashboardRoleFrequencyCard;
