import DashboardModel from "@/models/DashboardModel";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button, ButtonGroup, Switch, Stack } from "@chakra-ui/react";

const DashboardSetActive = observer(
  (props: { model: typeof DashboardModel }) => {
    const [isClicked, setIsClicked] = useState(false);
    const handleClick = () => {
      setIsClicked(!isClicked);
    };
    return (
      <>
        <Stack direction="row" spacing={4} align="center">
          <Button
            colorScheme={isClicked ? "turquoise" : "#718096"}
            variant={isClicked ? "solid" : "outline"}
            size="lg"
            onClick={handleClick}
            position="absolute"
            top="10px"
            left="10px"
          >
            {isClicked ? "Active" : "Set to Active"} {}
          </Button>
        </Stack>
        ; ;
      </>
    );
  }
);

export default DashboardSetActive;
